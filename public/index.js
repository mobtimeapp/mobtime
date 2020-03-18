import { app, h } from 'https://unpkg.com/hyperapp?module=1';

const ApiEffectFX = (dispatch, { endpoint, token, OnOK, OnERR }) => {
  const authHeaders = token
    ? { Authorization: `token ${token}` }
    : {};

  const headers = {
    Accept: 'application/json',
    ...authHeaders,
  };
    
  return fetch(endpoint, { headers })
    .then(r => {
      if (!r.ok) {
        const error = new Error(`Status ${r.status}: ${r.statusText}`);
        error.response = r;
        throw error;
      }
      return r.json();
    })
    .then(data => dispatch(OnOK, data))
    .catch(err => dispatch(OnERR, err));
};
const ApiEffect = props => [ApiEffectFX, props];

const NotificationPermissionFX = (dispatch, { SetAllowNotification }) => {
  Notification.requestPermission()
    .then((value) => {
      dispatch(SetAllowNotification, value === 'granted');
    })
    .catch((err) => {
      console.warn('Unable to ask for notification permission', err);
      dispatch(SetAllowNotification, false);
    });
};
const NotificationPermission = props => [NotificationPermissionFX, props];

const DisplayNotificationFx = (dispatch, { title, text }) => {
  new Notification(title, {
    body: text,
    vibrate: true,
  })
};
const DisplayNotification = props => [DisplayNotificationFx, props];

const SetAllowNotification = (state, allowNotification) => ({ ...state, allowNotification });

const Init = () => [
  {
    serverState: {
      timerRunning: false,
      timerRemaining: 0,
      mob: [],
    },
    token: '',
    name: '',
    timeInMinutes: '5',
    allowNotification: Notification.permission == 'granted',
  },
];

const SetToken = (state, token) => ({
  ...state,
  token,
});

const Tick = (state, serverState) => {
  return {
    ...state,
    serverState,
  };
};

const Completed = state => [
  state,
  DisplayNotification({
    title: 'Mob Timer',
    text: 'The time is up, cycle and start a new timer',
  }),
]

const UpdateName = (state, name) => ({
  ...state,
  name,
});

const ShuffleMob = state => [
  state,
  ApiEffect({
    endpoint: '/api/mob/shuffle',
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];
const CycleMob = state => [
  state,
  ApiEffect({
    endpoint: '/api/mob/cycle',
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

const AddNameToMob = state => [
  {
    ...state,
    name: '',
  },
  ApiEffect({
    endpoint: `/api/mob/add/${encodeURIComponent(state.name)}`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

const RemoveNameFromMob = (state, name) => [
  state,
  ApiEffect({
    endpoint: `/api/mob/remove/${encodeURIComponent(name)}`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

const UpdateTimeInMinutes = (state, timeInMinutes) => ({
  ...state,
  timeInMinutes,
});

const Noop = state => state;

const PauseTimer = state => [
  state,
  ApiEffect({
    endpoint: `/api/timer/pause`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];
const ResumeTimer = state => [
  state,
  ApiEffect({
    endpoint: `/api/timer/resume`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];
const StartTimer = state => {
  const milliseconds = (Number(state.timeInMinutes) * 60000) + 999;

  return [
    state,
    ApiEffect({
      endpoint: `/api/timer/start/${milliseconds}`,
      token: state.token,
      OnOK: Noop,
      OnERR: Noop,
    }),
  ];
};

const RequestNotificationPermission = state => [state, NotificationPermission({ SetAllowNotification })];

const WebsocketFX = (dispatch) => {
  const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

  socket.addEventListener('open', () => {
  });

  socket.addEventListener('close', () => {
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.token) {
      dispatch(SetToken, message.token);
    }

    dispatch(Tick, message.state);

    if (message.type === 'complete') {
      dispatch(Completed);
    }
  });

  return () => {
    socket.close();
    socket = null;
  };
};
const Websocket = props => [WebsocketFX, props];

const timerRemainingDisplay = milliseconds => {
  if (!milliseconds) {
    return '00:00';
  }
  const minutes = Math.floor(milliseconds / 60000);
  const remainingMilliseconds = milliseconds - (minutes * 60000);
  const seconds = Math.floor(remainingMilliseconds / 1000);

  return [minutes, seconds]
    .map(t => `${t}`.padStart(2, '0'))
    .join(':');
};

const renderPosition = (name, position) => h('div', {
  class: {
    'rounded': true,
    'overflow-hidden': true,
    'shadow': true,
    'pt-2': true,
    'pb-1': true,
    'px-1': true,
    'mx-1': true,
    'mb-1': true,
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
  },
}, [
  h('div', null, [
    h('div', {
      class: {
        'text-gray-500': !name,
      },
    }, name || 'Empty'),
    h('div', {
      class: {
        'uppercase': true,
        'text-xs': true,
        'text-gray-300': true,
      },
    }, position),
  ]),
  h('button', {
    class: {
      'rounded-full': true,
      'border': true,
      'flex': true,
      'items-center': true,
      'justify-center': true,
      'text-center': true,
      'border-blue-500': true,
      'hover:text-white': true,
      'hover:bg-blue-500': true,
      'hover:border-transparent': true,
      'text-blue-700': true,
    },
    style: {
      width: '32px',
      height: '32px',
    },
    onclick: [RemoveNameFromMob, name],
  }, 'X'),
]);

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
    renderPosition(name, position)
  ])));
};

const standardButton = (props, children) => h(
  'button',
  {
    type: 'button',
    ...props,
    class: {
      'py-2': true,
      'px-4': true,
      'font-semibold': true,
      'border-blue-500': true,
      'border': true,
      'hover:text-white': !props.disabled,
      'hover:bg-blue-500': !props.disabled,
      'hover:border-transparent': !props.disabled,
      'rounded': true,

      'text-blue-700': !props.disabled,
      'border-blue-500': !props.disabled,
      'text-blue-500': !props.disabled,
      'border-blue-300': !props.disabled,
      ...(props.class || {}),
    },
  },
  children,
);

app({
  init: Init,

  view: state => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
    },
  }, h('div', {
    class: {
      'w-11/12': true,
      'sm:w-8/12': true,
      'lg:w-6/12': true,
      'xl:w-4/12': true,
      'rounded': true,
      'overflow-hidden': true,
      'shadow-lg': true,
    },
  }, [
    !state.allowNotification && h('div', null, [
      h('button', {
        class: {
          'w-full': true,
          'bg-blue-500': true,
          'hover:bg-blue-700': true,
          'text-white': true,
          'font-bold': true,
          'py-2': true,
          'px-4': true,
        },
        onclick: RequestNotificationPermission,
      }, 'Enable Notifications'),
    ]),
    h('div', {
      class: {
        'flex': true,
        'flex-row': true,
        'px-2': true,
        'align-center': true,
        'justify-between': true,
        'pt-3': true,
        'pb-2': true,
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
        h(standardButton, {
          class: {
            'block': true,
            'w-full': true,
            'mb-1': true,
          },
          disabled: !state.serverState.timerRunning,
          onclick: PauseTimer,
        }, 'Pause'),
        h(standardButton, {
          class: {
            'block': true,
            'w-full': true,
          },
          disabled: state.serverState.timerRunning || state.serverState.timerRemaining === 0,
          onclick: ResumeTimer,
        }, 'Resume'),
      ]),
    ]),
    h('hr'),
    h('div', {
      class: {
        'px-2': true,
        'pt-3': true,
        'pb-2': true,
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    }, [
      h('span', null, [
        h('span', null, 'Start timer for'),
        h('label', null, [
          h('input', {
            type: 'number',
            value: state.timeInMinutes,
            min: 1,
            max: 60,
            step: 1,
            oninput: [UpdateTimeInMinutes, e => e.target.value],
            class: {
              'border-b': true,
              'border-dotted': true,
              'mx-1': true,
            },
            style: {
              width: '50px',
              textAlign: 'center',
              fontWeight: 'bold',
            },
          }),
          h('span', null, `minute${state.timeInMinutes != 1 ? 's' : ''}`),
        ]),
      ]),
      h(standardButton, {
        disabled: !state.timeInMinutes,
        onclick: StartTimer,
      }, 'Go!'),
    ]),

    h('hr'),

    h('div', {
      class: {
        'pt-3': true,
        'pb-2': true,
        'px-2': true,
      },
    }, [
      h('div', {
        class: {
          'flex': true,
          'items-center': true,
          'justify-between': true,
        },
      }, [
        h(standardButton, { onclick: CycleMob }, 'Cycle Mob'),
        h(standardButton, { onclick: ShuffleMob }, 'Shuffle'),
      ]),
      renderMob(state.serverState.mob),
    ]),

    h('hr'),

    h('div', {
      class: {
        'pt-3': true,
        'pb-2': true,
        'px-2': true,
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    }, [
      h('label', null, [
        h('span', null, 'Add'),
        h('input', {
          value: state.name,
          oninput: [UpdateName, e => e.target.value],
          placeholder: 'Name here...',
          class: {
            'border-b': true,
            'border-dotted': true,
            'mx-1': true,
          },
          style: {
            width: '120px',
          },
        }),
      ]),
      h(standardButton, { disabled: !state.name, onclick: AddNameToMob }, 'Go!'),
    ]),
  ])),

  subscriptions: () => [
    Websocket(),
  ],

  node: document.querySelector('#app'),
});

