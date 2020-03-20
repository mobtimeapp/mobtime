import * as effects from '/effects.js';

let initialAllowNotification = false;
if ('Notification' in window) {
  initialAllowNotification = Notification.permission === 'granted';
}

export const SetAllowNotification = (state, allowNotification) => ({ ...state, allowNotification });

export const Init = (_, timerId) => [
  {
    serverState: {
      timerStartedAt: null,
      timerDuration: 0,
      mob: [],
    },
    timerId,
    remainingTime: 0,
    token: '',
    name: '',
    timeInMinutes: '5',
    allowNotification: initialAllowNotification,
    websocketState: 'connecting',
  },
];

export const SetRemainingTime = (state, remainingTime) => [
  {
    ...state,
    remainingTime,
  },
  effects.UpdateTitleWithTime({ remainingTime }),
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
    remainingTime: serverState.timerStartedAt !== null
      ? Math.max(0, serverState.timerDuration - (Date.now() - serverState.timerStartedAt))
      : serverState.timerDuration,
  };
};

export const Completed = state => [
  {
    ...state,
    serverState: {
      ...state.serverState,
      timerStartedAt: null,
    },
    remainingTime: 0,
  },
  [
    effects.DisplayNotification({
      title: 'Mob Timer',
      text: 'The time is up, cycle and start a new timer',
    }),
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
  ]
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
