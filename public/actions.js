import * as State from './state.js';
import * as effects from './effects.js';
import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

export const SetModal = (state, modal) => State.setModal(state, modal);

export const DismissToast = state => State.dismissToastMessage(state);
export const AddToast = (state, { message, actions }) =>
  State.appendToasts(state, {
    message,
    actions: actions.map(a => ({
      ...a,
      onclick: previousState => a.onclick(DismissToast(previousState)),
    })),
  });

export const SetProfile = (state, { profile, init }) => {
  let setProfileEffects = [
    init && profile.firstTime && effects.Act([SetModal, 'profile']),
    init &&
      !profile.firstTime &&
      effects.Act([
        AddToast,
        {
          message: `Hey ${profile.name}, would you like to join this session?`,
          actions: [{ text: 'Yes, please', onclick: AddMeToMob }],
        },
      ]),
  ].filter(v => v);
  if (setProfileEffects.length === 0) {
    setProfileEffects = [
      init &&
        profile.enableSounds &&
        effects.Act([
          AddToast,
          {
            message:
              'To enable sounds in mobti.me, you must interact with the page',
            actions: [],
          },
        ]),
    ];
  }
  return [
    State.mergeLocal(State.setProfile(state, profile), {
      giphyResults: [{ title: 'Saved Avatar', url: profile.avatar }],
    }),
    ...setProfileEffects,
  ];
};

export const ResetProfile = state => [
  state,
  effects.DeleteProfile({ externals: state.externals }),
  effects.LoadProfile({
    externals: state.externals,
    setProfile: SetProfile,
    init: false,
  }),
];

export const SaveProfile = state => [
  State.setModal(state, null),
  effects.SaveProfile({
    externals: state.externals,
    profile: State.getProfile(state),
    setProfile: SetProfile,
  }),
];
/*
 *
      effects.Act([
        AddToast,
        {
          message: `Hey ${profile.name}, would you like to join this session?`,
          actions: [{ text: 'Yes, please', onclick: AddMeToMob }],
        },
      ]),
      */
export const UpdateProfile = (state, profilePartial) => {
  const nextState = State.mergeProfile(state, profilePartial);
  const profile = {
    current: State.getProfile(state),
    next: State.getProfile(nextState),
  };
  const mob = State.getMob(state);
  const isInMobAlready = mob.some(m => m.id === profile.current.id);
  if (!isInMobAlready) {
    return nextState;
  }

  return [nextState, effects.Act(UpdateSelfInMob)];
};

export const Init = (_, { timerId, externals }) => [
  State.initial(timerId, externals),
  effects.LoadProfile({
    externals,
    setProfile: SetProfile,
    init: true,
  }),
];

export const SetCurrentTime = (state, { currentTime }) => {
  const nextState = State.setCurrentTime(state, currentTime);
  const remainingTime = calculateTimeRemaining(nextState);

  return [
    nextState,
    effects.UpdateTitleWithTime({
      remainingTime,
      externals: state.externals,
    }),
  ];
};

export const ProfileModalSetGiphyResults = (state, giphyResults) =>
  State.mergeLocal(state, { giphyResults });
export const ProfileModalGiphySearch = (state, giphySearch) => [
  State.mergeLocal(state, {
    giphySearch,
  }),
  effects.SearchGiphy({
    profile: State.getProfile(state),
    giphySearch,
    setResults: ProfileModalSetGiphyResults,
  }),
];

export const EndTurn = state => {
  if (state.timerStartedAt === null) {
    return state;
  }

  return [
    State.endTurn(state),
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      externals: state.externals,
    }),
    effects.Notify({
      notification: state.allowNotification,
      sound: state.profile.allowSound,
      title: 'Mobtime',
      text: 'The timer is up!',
      externals: state.externals,
    }),
  ];
};

export const Completed = (state, { isEndOfTurn }) => [
  State.cycleMob(State.endTurn(state)),
  effects.UpdateTitleWithTime({
    remainingTime: 0,
    externals: state.externals,
  }),
  isEndOfTurn &&
    effects.andThen({
      action: EndTurn,
      props: {},
    }),
];
export const CompletedAndShare = (state, { isEndOfTurn }) => [
  ...Completed(state, { isEndOfTurn }),
  effects.CompleteTimer({
    websocketPort: state.websocketPort,
  }),
];

export const ShareMob = state => [
  state,
  effects.UpdateMob({
    websocketPort: state.websocketPort,
    mob: State.getMob(state),
  }),
];

export const UpdateUser = (state, { id, ...update }) => {
  const mob = State.getMob(state).map(m =>
    m.id === id ? { ...m, ...update, id } : m,
  );

  return ShareMob(State.setMob(state, mob));
};

export const RenameUser = (state, { id, value }) =>
  UpdateUser(state, { id, name: value });

export const SetMob = (state, mob) => State.setMob(state, mob);

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

export const AddMeToMob = state => {
  const profile = State.getProfile(state);
  const mob = State.getMob(state);
  const isInMobAlready = mob.some(m => m.id === profile.id);

  if (isInMobAlready) {
    return state;
  }

  return ShareMob(
    State.addToMob(state, profile.name, profile.avatar, profile.id),
  );
};

export const AddAnonymousToMob = (state, anonymous) =>
  ShareMob(
    State.addToMob(state, anonymous.name, anonymous.avatar, anonymous.id),
  );

export const UpdateAnonymousInMob = (state, anonymous) =>
  ShareMob(State.updateInMob(state, anonymous));
export const UpdateSelfInMob = state =>
  ShareMob(State.updateInMob(state, State.getProfile(state)));

export const RemoveFromMob = (state, mobber) =>
  ShareMob(State.removeFromMob(state, mobber.id));

export const ShareGoals = state => [
  state,
  effects.UpdateGoals({
    websocketPort: state.websocketPort,
    goals: State.getGoals(state),
  }),
];

export const AddGoal = (state, { text: goalText, parentId }) =>
  ShareGoals(State.addToGoals(state, goalText, parentId));

export const UpdateGoal = (state, { text: goalText, parentId, id }) =>
  ShareGoals(State.updateGoal(state, id, goalText, parentId));

export const CompleteGoal = (state, { id, completed }) =>
  ShareGoals(State.completeGoal(state, id, completed));

export const RemoveGoal = (state, goal) =>
  ShareGoals(State.removeGoal(state, goal.id));

export const RemoveCompletedGoals = state =>
  ShareGoals(State.removeCompletedGoals(state));

export const RenameGoal = (state, { id, value }) =>
  ShareGoals(State.editGoal(state, id, value));

export const SetGoals = (state, goals) => State.setGoals(state, goals);

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const SetParentOfGoal = (state, { goal, parent }) =>
  ShareGoals(State.goalSetParent(state, { goal, parent }));

export const PauseTimer = (state, currentTime = Date.now()) =>
  State.pauseTimer(state, currentTime);

export const PauseTimerAndShare = (state, currentTime = Date.now()) => {
  const nextState = PauseTimer(state, currentTime);

  return [
    nextState,
    effects.PauseTimer({
      websocketPort: state.websocketPort,
      timerDuration: state.timerDuration,
    }),
  ];
};

export const ResumeTimer = (state, timerStartedAt = Date.now()) =>
  State.resumeTimer(state, timerStartedAt);

export const ResumeTimerAndShare = (state, timerStartedAt = Date.now()) => [
  ResumeTimer(state, timerStartedAt),
  effects.StartTimer({
    websocketPort: state.websocketPort,
    timerDuration: state.timerDuration,
  }),
];

export const StartTimer = (state, timerStartedAt) => {
  const { duration } = State.getShared(state);
  return State.startTimer(state, timerStartedAt, duration);
};

export const StartTimerAndShare = (state, timerStartedAt) => {
  const nextState = StartTimer(state, timerStartedAt);
  return [
    nextState,
    effects.StartTimer({
      websocketPort: state.websocketPort,
      timerDuration: nextState.timerDuration,
    }),
  ];
};

export const ReplaceTimer = (state, timerAttributes) => ({
  ...state,
  ...timerAttributes,
});

// export const SetAllowNotification = (state, { allowNotification }) => [
// {
// ...state,
// allowNotification,
// },
// allowNotification &&
// effects.Notify({
// title: 'Mobtime Config',
// text: 'You have allowed notifications',
// sound: false,
// externals: state.externals,
// }),
// ];

// export const SetNotificationPermissions = (
// state,
// { notificationPermissions },
// ) => [
// {
// ...state,
// notificationPermissions,
// },
// notificationPermissions === 'granted' &&
// effects.andThen({
// action: SetAllowNotification,
// props: {
// allowNotification: true,
// },
// }),
// ];

// export const RequestNotificationPermission = state => [
// state,
// effects.NotificationPermission({
// SetNotificationPermissions,
// Notification: state.Notification,
// documentElement: state.documentElement,
// }),
// ];

// export const ShowNotification = (state, message) => [
// state,
// effects.DisplayNotification({
// title: 'Cycle Complete',
// text: message,
// }),
// ];

// export const PendingSettingsReset = state => State.pendingSettingsReset(state);

// export const PendingSettingsSet = (state, { key, value }) =>
// State.pendingSettingSet(state, key, value);

export const ShareSettings = state => [
  state,
  effects.UpdateSettings({
    websocketPort: state.websocketPort,
    settings: State.getShared(state),
  }),
];

export const UpdatePositions = (state, positions) =>
  ShareSettings(State.setPositions(state, positions));

export const UpdateSettings = state =>
  ShareSettings(
    State.mergeShared(state, {}), // TODO: Where are the new settings coming from?
  );

export const ReplaceSettings = (state, settings) =>
  State.setShared(state, settings);

export const BroadcastJoin = state => [
  state,
  effects.BroadcastJoin({
    websocketPort: state.websocketPort,
  }),
];

export const ShareEverything = state => [
  state,
  effects.UpdateMob({
    websocketPort: state.websocketPort,
    mob: State.getMob(state),
  }),
  effects.UpdateGoals({
    websocketPort: state.websocketPort,
    goals: State.getGoals(state),
  }),
  effects.UpdateSettings({
    websocketPort: state.websocketPort,
    settings: State.getShared(state),
  }),
  state.timerStartedAt > 0 &&
    effects.StartTimer({
      websocketPort: state.websocketPort,
      timerDuration: calculateTimeRemaining(state),
    }),
];

export const SetOwnership = (state, isOwner) =>
  State.mergeLocal(state, { isOwner });
