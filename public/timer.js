import * as actions from '/actions.js';
import { layout } from '/components/layout.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { summary } from '/sections/summary.js';
import * as subscriptions from '/subscriptions.js';
import { app, h, text } from '/vendor/hyperapp.js';

const node = document.querySelector('#app');

app({
  init: actions.Init(null, node.getAttribute('data-timer-id')),

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

  subscriptions: state => {
    const { timerId } = state;

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

      // drag.type &&
      // subscriptions.DragAndDrop({
      // active: drag.active,
      // DragMove: actions.DragMove,
      // DragEnd: actions.DragEnd,
      // DragCancel: actions.DragCancel,
      // }),
    ];
  },

  node,
});
