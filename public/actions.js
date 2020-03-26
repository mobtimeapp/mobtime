import * as effects from '/effects.js';
import Status from '/status.js';

const withToken = (fn, status) => Status.caseOf({
  Connecting: () => false,
  Connected: fn,
  Reconnecting: () => false,
  Error: () => false,
}, status);

let initialAllowNotification = false;
if ('Notification' in window) {
  initialAllowNotification = Notification.permission === 'granted';
}

export const Noop = (state) => state;

export const Init = (_, timerId) => [
  {
    serverState: {
      timerStartedAt: null,
      timerDuration: 0,
      mob: [],
      goals: [],
      lockedMob: null,
      connections: 0,
    },
    timerId,
    remainingTime: 0,
    name: '',
    goal: '',
    timeInMinutes: '0.1',
    allowNotification: initialAllowNotification,
    status: Status.Connecting(),
  },
];

export const SetRemainingTime = (state, remainingTime) => [ {
    ...state,
    remainingTime,
  },
  effects.UpdateTitleWithTime({ remainingTime }),
];

export const SetStatus = (state, status) => ({ ...state, status });

export const SetToken = (state, token) => ({
  ...state,
  status: token
    ? Status.Connected(token)
    : Status.Connecting(),
});

export const Tick = (state, serverState) => ({
  ...state,
  serverState,
  remainingTime: serverState.timerStartedAt !== null
    ? Math.max(0, serverState.timerDuration - (Date.now() - serverState.timerStartedAt))
    : serverState.timerDuration,
});

export const Completed = (state) => [
  {
    ...state,
    serverState: {
      ...state.serverState,
      timerStartedAt: null,
    },
    remainingTime: 0,
  },
  [
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
    withToken(
      (token) => effects.ApiEffect({
        endpoint: '/api/timer/reset',
        token,
        OnOK: Noop,
        OnERR: Noop,
      }),
      state.status,
    ),
  ],
];

export const UpdateName = (state, name) => ({
  ...state,
  name,
});

export const ShuffleMob = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/mob/shuffle',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];
export const CycleMob = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/mob/cycle',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const LockMob = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/mob/lock',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];
export const UnlockMob = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/mob/unlock',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const AddNameToMob = (state) => [
  {
    ...state,
    name: '',
  },
  withToken(
    (token) => effects.ApiEffect({
      endpoint: `/api/mob/add/${encodeURIComponent(state.name)}`,
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const RemoveNameFromMob = (state, name) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: `/api/mob/remove/${encodeURIComponent(name)}`,
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const AddGoal = (state) => [
  { ...state, goal: '' },
  withToken(
    (token) => effects.ApiEffect({
      endpoint: `/api/mob/goals/add/${encodeURIComponent(state.goal)}`,
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];
export const CompleteGoal = (state, { text, completed }) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: `/api/mob/goals/${encodeURIComponent(text)}/${completed ? 'complete' : 'uncomplete'}`,
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];
export const RemoveGoal = (state, text) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: `/api/mob/goals/remove/${encodeURIComponent(text)}`,
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const UpdateTimeInMinutes = (state, timeInMinutes) => ({
  ...state,
  timeInMinutes,
});

export const PauseTimer = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/timer/pause',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const ResumeTimer = (state) => [
  state,
  withToken(
    (token) => effects.ApiEffect({
      endpoint: '/api/timer/resume',
      token,
      OnOK: Noop,
      OnERR: Noop,
    }),
    state.status,
  ),
];

export const StartTimer = (state) => {
  const milliseconds = (Number(state.timeInMinutes) * 60 * 1000) + 999;

  return [
    state,
    withToken(
      (token) => effects.ApiEffect({
        endpoint: `/api/timer/start/${milliseconds}`,
        token,
        OnOK: Noop,
        OnERR: Noop,
      }),
      state.status,
    ),
  ];
};

export const SetAllowNotification = (state, allowNotification) => ({ ...state, allowNotification });

export const RequestNotificationPermission = (state) => [
  state,
  effects.NotificationPermission({
    SetAllowNotification,
  }),
];

export const ShowNotification = (state, message) => [
  state,
  effects.DisplayNotification({
    title: 'Cycle Complete',
    text: message,
  }),
];
