import * as actions from '/actions.js';
import { layout } from '/components/layout.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import * as subscriptions from '/subscriptions.js';
import { app } from '/vendor/hyperapp.js';

const node = document.querySelector('#app');

app({
  init: actions.Init(null, node.getAttribute('data-timer-id')),

  view: state => {
    return layout([header(), timeRemaining(state)]);
  },

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

  node,
});
