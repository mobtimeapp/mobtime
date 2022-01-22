import * as actions from '/actions.js';
import { card } from '/components/card.js';
import { appPrompt } from '/components/prompt.js';
import { section } from '/components/section.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { toasts } from '/sections/toasts.js';
import * as subscriptions from '/subscriptions.js';
import { app, h, text } from '/vendor/hyperapp.js';

import { tabs, showTab } from '/tabs/index.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);
const flags = window.location.search
  .slice(1)
  .split('&')
  .reduce((memo, option) => {
    const [key, value] = option.split('=');
    return {
      ...memo,
      [key]: value,
    };
  }, {});

const connectionStatus = ({ websocket }) => {
  if (!websocket || websocket.readyState === WebSocket.CONNECTING) {
    return 'will-connect';
  }
  return websocket.readyState === WebSocket.OPEN
    ? 'connected'
    : 'will-reconnect';
};

const websocketStatusClass = {
  'will-connect': {
    'text-gray-500': true,
  },
  connected: {
    'text-gray-500': true,
  },
  'will-reconnect': {
    'bg-red-500': true,
  },
};

const websocketStatusMessage = {
  'will-connect': 'Websocket connecting...',
  connected: 'Websocket Connection established',
  'will-reconnect': 'Websocket reconnecting...',
};

app({
  init: actions.Init(null, {
    timerId: initialTimerId,
    externals: {
      documentElement: window.document,
      Notification: window.Notification,
      storage: window.localStorage,
      location: window.location,
      history: window.history,
    },
    dark: 'dark' in flags,
  }),

  view: state =>
    h(
      'div',
      {
        class: {
          flex: true,
          'items-start': true,
          'justify-center': true,
          'min-h-screen': true,
        },
      },
      [
        card(
          {
            class: {
              'box-border': true,
              'min-h-screen': true,
              'sm:min-h-0': true,
              'w-full': true,
              'sm:w-8/12': true,
              'md:w-10/12': true,
              'lg:w-6/12': true,
              shadow: false,
              'sm:shadow-lg': true,
              'pt-2': false,
              'pt-0': true,
              'pb-12': true,
              'pb-1': false,
              'sm:mt-2': true,
              rounded: false,
              'sm:rounded': true,
              relative: true,
            },
          },
          [
            header(),
            timeRemaining(state),
            tabs(state),
            showTab(state),
            section(
              {
                class: {
                  'w-full': true,
                  ...websocketStatusClass[connectionStatus(state)],
                  'text-center': true,
                  'text-xs': true,
                },
              },
              text(websocketStatusMessage[connectionStatus(state)]),
            ),

            h(
              'audio',
              {
                preload: 'auto',
                id: 'timer-complete',
                key: state.sound,
              },
              [
                h('source', {
                  src: `/audio/${state.sound}.wav`,
                  type: 'audio/wav',
                }),
              ],
            ),

            state.prompt.visible && appPrompt(state.prompt || {}),
          ],
        ),
        toasts(state),
      ],
    ),

  subscriptions: state => {
    const { timerId, drag } = state;

    return [
      timerId &&
        subscriptions.Websocket({
          actions,
          timerId,
        }),

      subscriptions.Timer({
        timerStartedAt: state.timerStartedAt,
        timerDuration: state.timerDuration,
        actions,
      }),

      drag.type &&
        subscriptions.DragAndDrop({
          active: drag.active,
          DragMove: actions.DragMove,
          DragEnd: actions.DragEnd,
          DragCancel: actions.DragCancel,
        }),
    ];
  },

  node: document.querySelector('#app'),
});
