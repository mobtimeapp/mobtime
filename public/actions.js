import * as State from './state.js';
import * as effects from './effects.js';
import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

let initialNotificationPermission = '';
if (typeof window !== 'undefined' && 'Notification' in window) {
  initialNotificationPermission = Notification.permission;
}

export const SetAllowSound = (state, allowSound) => [
  {
    ...state,
    allowSound,
  },
];

export const DismissToast = state => State.dismissToastMessage(state);

const makeToastMessage = (message, actions) => ({
  message,
  actions: actions.map(a => ({
    ...a,
    onclick: state => a.onclick(DismissToast(state)),
  })),
});

const toastMessages = {
  firstTime: [
    makeToastMessage('Mobtime sounds are turned off', [
      { text: 'Turn on', onclick: s => s },
      { text: `Leave off, and don't ask again`, onclick: s => s },
    ]),
    makeToastMessage('Mobtime notifications are turned off', [
      { text: 'Request permission', onclick: s => s },
      { text: `Leave off, and don't ask again`, onclick: s => s },
    ]),
  ],
  activateSound: [
    makeToastMessage('Mobtime sounds need to be activated', [
      { text: 'Activate', onclick: state => SetAllowSound(state, true) },
    ]),
  ],
  default: [],
};

export const SetProfile = (state, profile) => {
  let messages = toastMessages.default;
  if (profile.firstTime) {
    messages = toastMessages.firstTime;
  } else {
    messages = [...(profile.allowSound ? toastMessages.activateSound : [])];
  }

  return [
    {
      ...state,
      profile,
      toastMessages: messages,
    },
  ];
};

export const Init = (_, timerId) => [
  {
    ...State.initial(timerId, initialNotificationPermission),
  },
  effects.LoadProfile({
    localStorage: window.localStorage,
    onLoad: SetProfile,
  }),
];

export const SetCurrentTime = (state, { currentTime, documentElement }) => {
  const nextState = State.setCurrentTime(state, currentTime);
  const remainingTime = calculateTimeRemaining(nextState);

  return [
    nextState,
    effects.UpdateTitleWithTime({
      remainingTime,
      documentElement,
    }),
  ];
};

export const SetWebsocket = (state, { websocket }) =>
  State.setWebsocket(state, websocket);

export const EndTurn = (state, { documentElement, Notification }) => [
  State.endTurn(state),
  [
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      documentElement,
    }),
    effects.Notify({
      notification: state.allowNotification,
      sound: state.profile.allowSound,
      title: 'Mobtime',
      text: 'The timer is up!',
      Notification,
      documentElement,
    }),
  ],
];

export const Completed = (
  state,
  { isEndOfTurn, documentElement, Notification },
) => [
  State.cycleMob(State.endTurn(state)),
  effects.CompleteTimer({
    websocket: state.websocket,
  }),
  isEndOfTurn &&
    effects.andThen({
      action: EndTurn,
      props: {
        documentElement,
        Notification,
      },
    }),
];

export const ShareMob = state => [
  state,
  effects.UpdateMob({
    websocket: state.websocket,
    mob: State.getMob(state),
  }),
];

export const RenameUser = (state, { id, value }) => {
  const mob = state.mob.map(m => ({
    ...m,
    name: m.id === id ? value : m.name,
  }));

  return ShareMob(State.setMob(state, mob));
};

export const UpdateName = (state, name) => ({
  ...state,
  name,
});

export const ShuffleMob = state => ShareMob(State.shuffleMob(state));

export const CycleMob = state => [
  ...ShareMob(State.shuffleMob(state)),
  state.timerStartedAt > 0 &&
    effects.andThen({
      action: Completed,
      props: { isEndOfTurn: true },
    }),
];

export const AddNameToMob = state =>
  ShareMob(
    State.addToMob(state, 'Dudley', null), // TODO
  );

export const RemoveFromMob = (state, id) =>
  ShareMob(State.removeFromMob(state, id));

export const ShareGoals = state => [
  state,
  effects.UpdateGoals({
    websocket: state.websocket,
    goals: State.getGoals(state),
  }),
];

export const AddGoal = state =>
  ShareGoals(
    State.addToGoals(state, 'Do better'), // TODO
  );

export const CompleteGoal = (state, { id, completed }) =>
  ShareGoals(State.completeGoal(state, id, completed));

export const RemoveGoal = (state, id) =>
  ShareGoals(State.removeGoal(state, id));

export const RemoveCompletedGoals = state =>
  ShareGoals(State.removeCompletedGoals(state));

export const RenameGoal = (state, { id, value }) =>
  ShareGoals(State.editGoal(state, id, value));

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const PauseTimer = (state, currentTime = Date.now()) => {
  const nextState = State.pauseTimer(state, currentTime);

  return [
    nextState,
    effects.PauseTimer({
      websocket: state.websocket,
      timerDuration: state.timerDuration,
    }),
  ];
};

export const ResumeTimer = (state, timerStartedAt = Date.now()) => [
  State.resumeTimer(state, timerStartedAt),
  effects.StartTimer({
    websocket: state.websocket,
    timerDuration: state.timerDuration,
  }),
];

export const StartTimer = (state, { timerStartedAt, timerDuration }) => [
  State.startTimer(state, timerStartedAt, timerDuration),
  effects.StartTimer({
    websocket: state.websocket,
    timerDuration,
  }),
];

export const SetAllowNotification = (
  state,
  { allowNotification, Notification, documentElement },
) => [
  {
    ...state,
    allowNotification,
  },
  allowNotification &&
    effects.Notify({
      title: 'Mobtime Config',
      text: 'You have allowed notifications',
      sound: false,
      Notification,
      documentElement,
    }),
];

export const SetNotificationPermissions = (
  state,
  { notificationPermissions, Notification, documentElement },
) => [
  {
    ...state,
    notificationPermissions,
  },
  notificationPermissions === 'granted' &&
    effects.andThen({
      action: SetAllowNotification,
      props: {
        allowNotification: true,
        Notification,
        documentElement,
      },
    }),
];

export const RequestNotificationPermission = (
  state,
  { Notification, documentElement },
) => [
  state,
  effects.NotificationPermission({
    SetNotificationPermissions,
    Notification,
    documentElement,
  }),
];

export const ShowNotification = (state, message) => [
  state,
  effects.DisplayNotification({
    title: 'Cycle Complete',
    text: message,
  }),
];

export const PendingSettingsReset = state => State.pendingSettingsReset(state);

export const PendingSettingsSet = (state, { key, value }) =>
  State.pendingSettingSet(state, key, value);

export const ShareSettings = state => [
  state,
  effects.UpdateSettings({
    websocket: state.websocket,
    settings: state.settings,
  }),
];

export const UpdateSettings = state =>
  ShareSettings(
    State.pendingSettingsReset(State.mergePendingSettingsIntoSettings(state)),
  );

export const BroadcastJoin = state => [
  state,
  effects.BroadcastJoin({
    websocket: state.websocket,
  }),
];

export const UpdateByWebsocketData = (
  state,
  { payload, documentElement, Notification },
) => {
  const { type, ...data } = payload;

  switch (type) {
    case 'settings:update':
      return State.setSettings(state, data.settings);

    case 'timer:start':
      return State.startTimer(state, Date.now(), data.timerDuration);

    case 'timer:pause':
      return State.pauseTimer(state, Date.now());

    case 'timer:update':
      return {
        ...state,
        timerStartedAt: data.timerStartedAt,
        timerDuration: data.timerDuration,
      };

    case 'timer:complete':
      if (state.timerStartedAt === null) {
        return state;
      }

      return EndTurn(state, {
        Notification,
        documentElement,
      });

    case 'goals:update':
      return State.setGoals(state, data.goals);

    case 'mob:update':
      return State.setMob(state, data.mob);

    case 'client:new':
      return [
        state,
        state.timerStartedAt > 0 &&
          effects.StartTimer({
            websocket: state.websocket,
            timerDuration: calculateTimeRemaining(state),
          }),
        effects.UpdateMob({ websocket: state.websocket, mob: state.mob }),
        effects.UpdateGoals({
          websocket: state.websocket,
          goals: state.goals,
        }),
        effects.UpdateSettings({
          websocket: state.websocket,
          settings: state.settings,
        }),
      ];

    case 'timer:ownership':
      return {
        ...state,
        isOwner: data.isOwner,
      };

    default:
      console.warn('Unknown websocket data', payload); // eslint-disable-line no-console
      return state;
  }
};
