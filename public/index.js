import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';
import timerRemainingDisplay from '/formatTime.js';

import { card } from '/components/card.js';
import { button } from '/components/button.js';
import { fullButton } from '/components/fullButton.js';
import { mobber } from '/components/mobber.js';
import { section } from '/components/section.js';
import { input } from '/components/input.js';

const WebsocketFX = (dispatch) => {
  const protocol = window.location.protocol === 'https:'
    ? 'wss'
    : 'ws';
  const websocketAddress = `${protocol}://${window.location.hostname}:${window.location.port}`;

  let socket = null;
  let handle = null;
  let cancel = false;

  const checkConnection = () => {
    return cancel
      ? null
      : fetch('/api/status')
        .then(r => {
          if (!r.ok) {
            socket.close();
          }
          handle = setTimeout(checkConnection, 10000);
        })
        .catch((err) => {
          if (socket) {
            socket.close();
          }
        });
  };

  const connect = () => {
    if (cancel) {
      return;
    }

    socket = new WebSocket(websocketAddress);

    dispatch(actions.SetWebsocketState, 'connecting');
    let connectionAttempt = setTimeout(() => {
      socket.close();
    }, 10000);

    socket.addEventListener('open', () => {
      clearTimeout(connectionAttempt);

      dispatch(actions.SetWebsocketState, 'connected');

      socket.addEventListener('close', () => {
        dispatch(actions.SetWebsocketState, 'disconnected');
        socket = null;
        setTimeout(connect, 10000);
      });
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.token) {
        dispatch(actions.SetToken, message.token);
      }

      dispatch(actions.Tick, message.state);
      if (message.state.timerRunning) {
        document.title = `${timerRemainingDisplay(message.state.timerRemaining)} - mobtime`;
      } else {
        document.title = 'mobtime';
      }

      if (message.type === 'complete') {
        dispatch(actions.Completed);
      }
    });
  };

  setTimeout(connect, 0);
  checkConnection();

  return () => {
    cancel = true;
    clearTimeout(handle);
    socket.close();
    socket = null;
  };
};
const Websocket = props => [WebsocketFX, props];

const renderMob = mob => {
  const [mobNavigator, mobDriver, ...rest] = mob;

  const items = [
    { name: mobNavigator, position: 'Navigator' },
    { name: mobDriver, position: 'Driver' },
    ...rest.map(name => ({ name, position: 'mob' })),
  ];

  return h('ol', {
    class: {
      'pt-2': true,
      'pb-1': true,
      'w-full': true,
    },
  }, items.map(({ name, position }) => h('li', null, [
    h(mobber, {
      position,
      name,
      onRemove: actions.RemoveNameFromMob,
    })
  ])));
};

app({
  init: actions.Init,

  view: state => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
      'pb-3': true,
    },
  }, h(card, {
    class: {
      'h-full': true,
      'sm:h-auto': true,
      'w-full': true,
      'sm:w-8/12': true,
      'lg:w-6/12': true,
      'xl:w-4/12': true,
      'shadow': false,
      'sm:shadow-lg': true,
      'pt-2': false,
      'pt-0': true,
      'pb-0': true,
      'pb-1': false,
      'sm:mt-2': true,
      'rounded': false,
      'sm:rounded': true,
    },
  }, [
    !state.allowNotification && h(fullButton, {
      onclick: actions.RequestNotificationPermission,
    }, 'Enable Notifications'),
    h(section, {
      class: {
        'flex': true,
        'flex-row': true,
        'px-2': true,
        'align-center': true,
        'justify-between': true,
      },
    }, [
      h('h1', {
        class: {
          'text-6xl': true,
          'flex': true,
        },
      }, timerRemainingDisplay(state.serverState.timerRemaining)),
      h('div', {
        class: {},
      }, [
        h(button, {
          class: {
            'block': true,
            'w-full': true,
            'mb-1': true,
          },
          disabled: !state.serverState.timerRunning,
          onclick: actions.PauseTimer,
        }, 'Pause'),
        h(button, {
          class: {
            'block': true,
            'w-full': true,
          },
          disabled: state.serverState.timerRunning || state.serverState.timerRemaining === 0,
          onclick: actions.ResumeTimer,
        }, 'Resume'),
      ]),
    ]),
    h('hr'),
    h(section, {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    }, [
      h('span', null, [
        h('span', null, 'Start timer for'),
        h('label', null, [
          h(input, {
            type: 'number',
            value: state.timeInMinutes,
            min: 1,
            max: 60,
            step: 1,
            oninput: [actions.UpdateTimeInMinutes, e => e.target.value],
            style: {
              width: '50px',
              textAlign: 'center',
              fontWeight: 'bold',
            },
          }),
          h('span', null, `minute${state.timeInMinutes != 1 ? 's' : ''}`),
        ]),
      ]),
      h(button, {
        disabled: !state.timeInMinutes,
        onclick: actions.StartTimer,
      }, 'Go!'),
    ]),

    h('hr'),

    h(section, null, [
      h('div', {
        class: {
          'flex': true,
          'items-center': true,
          'justify-between': true,
        },
      }, [
        h(button, { onclick: actions.CycleMob }, 'Cycle Mob'),
        h(button, { onclick: actions.ShuffleMob }, 'Shuffle'),
      ]),
      renderMob(state.serverState.mob),
    ]),

    h('hr'),

    h(section, {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    }, [
      h('label', null, [
        h('span', null, 'Add'),
        h(input, {
          value: state.name,
          oninput: [actions.UpdateName, e => e.target.value],
          placeholder: 'Name here...',
          style: {
            minWidth: '160px',
            fontWeight: 'bold',
          },
        }),
        h('span', {
          class: {
            'hidden': true,
            'sm:inline': true,
          },
        }, 'to the mob'),
      ]),
      h(button, { disabled: !state.name, onclick: actions.AddNameToMob }, 'Go!'),
    ]),
    h('hr'),
    h(section, {
      class: {
        'sm:flex': true,
        'flex-col': true,
        'items-center': true,
        'justify-center': true,
        'hidden': true,
      },
    }, [
      h('div', {
        class: {
          'text-md': true,
          'text-gray-600': true,
          'mb-3': true,
        },
      }, 'Scan this code to get the timer on your phone'),
      h('img', {
        src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location}`,
        class: {
          'mb-3': true,
        },
      }),
    ]),

    h('hr', {
      class: {
        'hidden': true,
        'sm:block': true,
      },
    }),

    h('div', {
      class: {
        'w-full': true,
        'bg-red-500': state.websocketState === 'disconnected',
        'bg-transparent': state.websocketState !== 'disconnected',
        'text-white': state.websocketState === 'disconnected',
        'text-gray-400': state.websocketState !== 'disconnected',
        'text-center': true,
        'py-1': true,
        'px-2': true,
        'text-xs': true,
      },
    }, `Websocket ${state.websocketState}`),
  ])),

  subscriptions: () => [
    Websocket(),
  ],

  node: document.querySelector('#app'),
});

