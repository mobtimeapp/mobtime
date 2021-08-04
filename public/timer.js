import * as actions from '/actions.js';
import * as port from './lib/port.js';
import { layout } from '/components/layout.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { summary } from '/sections/summary.js';
import * as subscriptions from '/subscriptions.js';
import { app } from '/vendor/hyperapp.js';
import * as State from '/state.js';
import { profileModal } from '/sections/profileModal.js';
import { editTimerModal } from '/sections/editTimerModal.js';

const node = document.querySelector('#app');

const modalMap = {
  profile: profileModal,
  editTimer: editTimerModal,
  _: () => null,
};
const showModal = state =>
  (modalMap[State.getLocalModal(state)] || modalMap._)(state);

const dispatchDebug = d => (...params) => {
  if (typeof params[0] === 'function') {
    console.log(
      '%caction',
      'font-weight: bold;',
      params[0].name,
      params[1] || null,
    );
  } else if (Array.isArray(params[0])) {
    const [s, ...e] = params[0];
    console.log('state', s);
    console.log(
      'effects',
      e.filter(fx => fx).map(([fx, props]) => [fx.name, props]),
    );
  } else {
    console.log('state', params[0]);
  }
  return d(...params);
};

app({
  init: actions.Init(
    {},
    {
      timerId: node.getAttribute('data-timer-id'),
      externals: {
        localStorage: window.localStorage,
        document: window.document,
        Notification: window.Notification,
        honk: new Audio('https://bigsoundbank.com/UPLOAD/mp3/1828.mp3'),
        makeId: () =>
          Math.random()
            .toString(36)
            .slice(2),
        websocketPort: port.make(['send']),
      },
    },
  ),

  view: state =>
    layout(
      {
        toastMessages: State.getToasts(state),
      },
      [header(), timeRemaining(state), summary(state), showModal(state)],
    ),

  subscriptions: state => [
    State.getTimerId(state) &&
      subscriptions.Websocket({
        timerId: State.getTimerId(state),
        websocketPort: State.getWebsocketPort(state),
        actions,
      }),

    subscriptions.Timer({ ...State.getTimer(state), actions }),
  ],

  dispatch: dispatchDebug,

  node,
});
