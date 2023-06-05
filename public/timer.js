import * as actions from '/actions.js';
import { card } from '/components/card.js';
import { appPrompt } from '/components/prompt.js';
import { grid } from '/components/grid.js';
import { mob } from '/tabs/mob.js';
import { goals } from '/tabs/goals.js';
import { settings } from '/tabs/settings.js';
import { qrShare } from '/tabs/qrShare.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { toasts } from '/sections/toasts.js';
import * as subscriptions from '/subscriptions.js';
import { drawer } from '/components/drawer.js';
import { app, h, text, memo } from '/vendor/hyperapp.js';
import * as Emitter from '/lib/emitter.js';

const stateWithoutFrequentChanges = ({ timerStartedAt, timerDuration, currentTime, mob, goals, ...state }) => state;

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
    lang: flags.lang || 'en_CA',
    dark: 'dark' in flags,
  }),

  view: state =>
    h(
      'div',
      {
        class: {
          'relative': true,
          'w-full': true,
          'min-h-screen': true,
        },
      },
      [
        h(
          'div',
          {
            class: {
              'container': true,
              'mx-auto': true,
              'flex': true,
              'flex-col': true,
              'items-center': true,
              'justify-start': true,
              'min-h-screen': true,
              'w-full': true,
            },
          },
          [
            grid([
              header(state),
              timeRemaining(state),
              mob(state),
              goals(state),
              // h('details', {}, [
              //   h('summary', {}, text('Configure your timer')),
              //   settings(state),
              // ]),
              // h('details', {}, [
              //   h('summary', {}, text('Share timer via QR Code')),
              //   qrShare(state),
              // ]),
            ]),

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
        state.showDrawer && memo(drawer, stateWithoutFrequentChanges(state)),
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
