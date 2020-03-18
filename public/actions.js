import * as effects from '/effects.js';

export const SetAllowNotification = (state, allowNotification) => ({ ...state, allowNotification });

export const Init = () => [
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
    websocketState: 'connecting',
  },
];

export const SetWebsocketState= (state, websocketState) => ({
  ...state,
  websocketState,
});

export const SetToken = (state, token) => ({
  ...state,
  token,
});

export const Tick = (state, serverState) => {
  return {
    ...state,
    serverState,
  };
};

export const Completed = state => [
  state,
  effects.DisplayNotification({
    title: 'Mob Timer',
    text: 'The time is up, cycle and start a new timer',
  }),
]

export const UpdateName = (state, name) => ({
  ...state,
  name,
});

export const ShuffleMob = state => [
  state,
  effects.ApiEffect({
    endpoint: '/api/mob/shuffle',
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];
export const CycleMob = state => [
  state,
  effects.ApiEffect({
    endpoint: '/api/mob/cycle',
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

export const AddNameToMob = state => [
  {
    ...state,
    name: '',
  },
  effects.ApiEffect({
    endpoint: `/api/mob/add/${encodeURIComponent(state.name)}`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

export const RemoveNameFromMob = (state, name) => [
  state,
  effects.ApiEffect({
    endpoint: `/api/mob/remove/${encodeURIComponent(name)}`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

export const UpdateTimeInMinutes = (state, timeInMinutes) => ({
  ...state,
  timeInMinutes,
});

export const Noop = state => state;

export const PauseTimer = state => [
  state,
  effects.ApiEffect({
    endpoint: `/api/timer/pause`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

export const ResumeTimer = state => [
  state,
  effects.ApiEffect({
    endpoint: `/api/timer/resume`,
    token: state.token,
    OnOK: Noop,
    OnERR: Noop,
  }),
];

export const StartTimer = state => {
  const milliseconds = (Number(state.timeInMinutes) * 60000) + 999;

  return [
    state,
    effects.ApiEffect({
      endpoint: `/api/timer/start/${milliseconds}`,
      token: state.token,
      OnOK: Noop,
      OnERR: Noop,
    }),
  ];
};

export const RequestNotificationPermission = state => [
  state,
  effects.NotificationPermission({
    SetAllowNotification,
  }),
];
