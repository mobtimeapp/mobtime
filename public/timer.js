import * as actions from '/actions.js';
import { card } from '/components/card.js';
import { appPrompt } from '/components/prompt.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { toasts } from '/sections/toasts.js';
import * as subscriptions from '/subscriptions.js';
import { app, h } from '/vendor/hyperapp.js';
import * as Emitter from '/lib/emitter.js';

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

app({
  init: actions.Init(null, {
    timerId: initialTimerId,
    externals: {
      documentElement: window.document,
      Notification: window.Notification,
      storage: window.localStorage,
      location: window.location,
      history: window.history,
      socketEmitter: Emitter.make(),
    },
    dark: 'dark' in flags,
  }),

  view: state =>
    h(
      'div',
      {
        class: {
          'flex': true,
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
              'shadow': false,
              'sm:shadow-lg': true,
              'pt-2': false,
              'pt-0': true,
              'pb-12': true,
              'pb-1': false,
              'sm:mt-2': true,
              'rounded': false,
              'sm:rounded': true,
              'relative': true,
            },
          },
          [
            header(state),
            timeRemaining(state),
            tabs(state),
            showTab(state),
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
    const { timerId, drag, websocketConnect, externals } = state;

    return [
      websocketConnect &&
        subscriptions.Websocket({
          actions,
          externals,
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
