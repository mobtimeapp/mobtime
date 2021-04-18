import * as actions from '/actions.js';
import { layout } from '/components/layout.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { summary } from '/sections/summary.js';
import * as subscriptions from '/subscriptions.js';
import { app, h, text } from '/vendor/hyperapp.js';
import * as State from '/state.js';
import { profileModal } from '/sections/profileModal.js';

const node = document.querySelector('#app');

app({
  init: actions.Init(
    {},
    {
      timerId: node.getAttribute('data-timer-id'),
      externals: {
        localStorage: window.localStorage,
        document: window.document,
        Notification: window.Notification,
      },
    },
  ),

  view: state => {
    return layout(
      {
        toastMessages: State.getToasts(state),
      },
      [
        header(),
        timeRemaining(state),
        summary(state),
        // h('pre', {}, h('code', {}, text(JSON.stringify(state, null, 2)))),
        profileModal(state),
      ],
    );
  },

  subscriptions: state => [
    State.getTimerId(state) &&
      subscriptions.Websocket({
        timerId: State.getTimerId(state),
        websocketPort: state.websocketPort,
        actions,
      }),

    subscriptions.Timer({ ...State.getTimer(state), actions }),
  ],

  // dispatch: (d) => (...params) => {
  // console.log('dispatch', ...params);
  // return d(...params);
  // },

  node,
});
