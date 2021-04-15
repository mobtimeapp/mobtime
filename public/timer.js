import * as actions from '/actions.js';
import { layout } from '/components/layout.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { summary } from '/sections/summary.js';
import * as subscriptions from '/subscriptions.js';
import { app, h, text } from '/vendor/hyperapp.js';

const node = document.querySelector('#app');

app({
  init: actions.Init(
    {},
    {
      timerId: node.getAttribute('data-timer-id'),
      externals: {
        documentElement: window.document,
        Notification: window.Notification,
      },
    },
  ),

  view: state => {
    return layout(
      {
        toastMessages: state.toastMessages,
      },
      [
        header(),
        timeRemaining(state),
        summary(state),
        h('pre', {}, h('code', {}, text(JSON.stringify(state, null, 2)))),
      ],
    );
  },

  subscriptions: ({
    timerId,
    timerStartedAt,
    timerDuration,
    websocketPort,
  }) => [
    timerId &&
      subscriptions.Websocket({
        actions,
        timerId,
        websocketPort,
      }),

    subscriptions.Timer({
      timerStartedAt,
      timerDuration,
      actions,
    }),
  ],

  node,
});
