import * as actions from '/actions.js';
import { card } from '/components/card.js';
import { appPrompt } from '/components/prompt.js';
import { section } from '/components/section.js';
import { tab } from '/components/tab.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import * as subscriptions from '/subscriptions.js';
import { app, h } from '/vendor/hyperapp.js';

import { tabs, showTab } from '/tabs/index.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);

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
    'bg-transparent': true,
    'text-gray-400': true,
  },
  "connected": {
    'bg-transparent': true,
    'text-gray-400': true,
  },
  'will-reconnect': {
    'bg-red-500': true,
    'text-white': true,
  },
};

const websocketStatusMessage = {
  'will-connect': 'Websocket connecting...',
  "connected": 'Websocket Connection established',
  'will-reconnect': 'Websocket reconnecting...',
};

app({
  init: actions.Init(null, initialTimerId),

  view: state =>
    h(
      'div',
      {
        class: {
          "flex": true,
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
              "shadow": false,
              'sm:shadow-lg': true,
              'pt-2': false,
              'pt-0': true,
              'pb-12': true,
              'pb-1': false,
              'sm:mt-2': true,
              "rounded": false,
              'sm:rounded': true,
              "relative": true,
            },
          },
          [
            header(),
            // timeRemaining(state),
            tabs(state),
            showTab(state),
            // h(
            //   section,
            //   {
            //     class: {
            //       'w-full': true,
            //       ...websocketStatusClass[connectionStatus(state)],
            //       'text-center': true,
            //       'text-xs': true,
            //     },
            //   },
            //   text(websocketStatusMessage[connectionStatus(state)]),
            // ),

            // h(
            //  'audio',
            //  {
            //    preload: 'auto',
            //    id: 'timer-complete',
            //  },
            //  [
            //    h('source', {
            //      src: 'https://bigsoundbank.com/UPLOAD/mp3/1828.mp3',
            //      type: 'audio/mp3',
            //    }),
            //    h('source', {
            //      src: 'https://bigsoundbank.com/UPLOAD/wav/1828.wav',
            //      type: 'audio/wav',
            //    }),
            //    h('source', {
            //      src: 'https://bigsoundbank.com/UPLOAD/flac/1828.flac',
            //      type: 'audio/flac',
            //    }),
            //  ],
            // ),

            // state.prompt.visible &&
            //  appPrompt(state.prompt || {}),
          ],
        ),
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
