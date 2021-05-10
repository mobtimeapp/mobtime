import * as State from './state.js';
import * as effects from './effects.js';

export const SetModal = (state, modal) => State.setLocalModal(state, modal);

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
  const isInMobAlready = State.isInMob(state, profile.id);
  const setProfileEffects = [
    init &&
      profile.firstTime &&
      effects.Act([
        AddToast,
        {
          message: `Customize profile?`,
          actions: [
            { text: 'Sounds good', onclick: s => SetModal(s, 'profile') },
          ],
        },
      ]),
    init &&
      !isInMobAlready &&
      effects.Act([
        AddToast,
        {
          message: `Add yourself to the mob?`,
          actions: [{ text: 'Yes, please', onclick: AddMeToMob }],
        },
      ]),
  ];
  return [
    State.mergeLocal(State.setProfile(state, profile), {
      giphyResults: [{ title: 'Saved Avatar', url: profile.avatar }],
    }),
    init &&
      profile.enableSounds &&
      effects.Act([
        AddToast,
        {
          message:
            'To enable sounds in mobti.me, you must interact with the page',
          actions: [{ text: 'Click here', onclick: s => [s] }],
        },
      ]),
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
  State.setLocalModal(state, null),
  effects.SaveProfile({
    externals: state.externals,
    profile: State.getProfile(state),
    setProfile: SetProfile,
  }),
];

export const UpdateLocal = (state, localPartial) =>
  State.mergeLocal(state, localPartial);

export const SaveLocal = state => [
  state,
  effects.SaveLocal({
    externals: State.getExternals(state),
    local: State.getLocal(state),
  }),
];
export const AutoSaveTimer = (state, autoSave) =>
  SaveLocal(
    autoSave
      ? State.localAutoSaveTimerAdd(state)
      : State.localAutoSaveTimerRemove(state),
  ).concat(
    autoSave
      ? [effects.Act([SaveTimer])]
      : [
          effects.Act([
            AddToast,
            {
              message: `Delete local timer data?`,
              actions: [{ text: 'Yes please', onclick: DeleteTimer }],
            },
          ]),
        ],
  );

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
  effects.LoadLocal({
    externals,
    onLoad: UpdateLocal,
  }),
];

export const AppendMessage = (state, message) => {
  if (State.getLocalHasLoaded(state)) return state;

  const nextState = State.setHasLoadedFromMessages(
    State.appendLocalMessages(state, message),
  );

  const hasLoaded = State.getLocalHasLoaded(nextState);

  return [
    nextState,
    hasLoaded &&
      effects.LoadProfile({
        externals: State.getExternals(nextState),
        setProfile: SetProfile,
        init: true,
      }),
  ];
};

export const PlayHonk = state => [
  state,
  effects.PlayHonk(state.externals.honk),
];

export const SetCurrentTime = (state, { currentTime }) => {
  const nextState = State.setLocalCurrentTime(state, currentTime);
  const remainingTime = State.calculateTimeRemaining(nextState, currentTime);

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

export const Completed = state => [
  State.cycleMob(State.endTurn(state)),
  effects.UpdateTitleWithTime({
    remainingTime: 0,
    externals: state.externals,
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
  ...ShareMob(State.cycleMob(state)),
  state.timerStartedAt > 0 &&
    effects.andThen({
      action: Completed,
      props: {},
    }),
  state.timerStartedAt > 0 &&
    effects.andThen({
      action: EndTurn,
      props: {},
    }),
];

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
  State.isLocalAutoSaveTimer(state) &&
    effects.SaveTimer({
      externals: State.getExternals(state),
      timerId: State.getTimerId(state),
      shared: State.getShared(state),
    }),
];

export const AddGoal = (state, goal) =>
  ShareGoals(State.addToGoals(state, goal));

export const UpdateGoal = (state, { text: goalText, parentId, id }) =>
  ShareGoals(State.updateGoal(state, id, goalText, parentId));

export const MoveGoal = (state, { goal, direction }) =>
  ShareGoals(
    Math.sign(direction) > 0
      ? State.moveGoalDown(state, goal)
      : State.moveGoalUp(state, goal),
  ).concat([effects.FocusInputAtEnd(`[data-goal-id="${goal.id}"]`)]);

export const CompleteGoal = (state, { id, completed }) =>
  ShareGoals(State.completeGoal(state, id, completed));

export const RemoveGoal = (state, goal) =>
  ShareGoals(State.removeGoal(state, goal.id));

export const RemoveCompletedGoals = state =>
  ShareGoals(State.removeCompletedGoals(state));

export const RenameGoal = (state, { id, value }) =>
  ShareGoals(State.editGoal(state, id, value));

export const SetGoals = (state, goals) => [
  State.setGoals(state, goals),
  State.isLocalAutoSaveTimer(state) &&
    effects.SaveTimer({
      externals: State.getExternals(state),
      timerId: State.getTimerId(state),
      shared: State.getShared(state),
    }),
];

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const PauseTimer = (state, currentTime = Date.now()) =>
  State.pauseTimer(state, currentTime);

export const ResumeTimer = (state, timerStartedAt = Date.now()) =>
  State.resumeTimer(state, timerStartedAt);

export const StartTimerAt = (state, { startedAt, remainingDuration }) => {
  return State.startTimerAt(state, startedAt, remainingDuration);
};

export const StartTimer = (state, timerStartedAt) =>
  StartTimerAt(state, {
    startedAt: timerStartedAt,
    remainingDuration: State.getDuration(state),
  });

export const ReplaceTimer = (state, timerAttributes) =>
  State.mergeTimer(state, timerAttributes);

export const PermitNotify = state => [
  state,
  effects.PermitNotify({
    externals: State.getExternals(state),
  }),
];

export const Notify = (state, { title, text, silent, actions, icon }) => {
  const profile = State.getProfile(state);
  if (!profile.enableNotifications) return state;

  return [
    state,
    effects.Notify({
      title,
      text,
      icon,
      silent,
      actions,
      externals: State.getExternals(state),
    }),
  ];
};

export const ShareSettings = state => [
  state,
  effects.UpdateSettings({
    websocketPort: state.websocketPort,
    settings: State.getShared(state),
  }),
];

export const UpdatePositions = (state, positions) =>
  ShareSettings(State.setPositions(state, positions));

export const UpdateSettings = (state, sharedPartial) =>
  ShareSettings(
    State.mergeShared(state, sharedPartial), // TODO: Where are the new settings coming from?
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
  State.getTimerStartedAt(state) > 0 &&
    effects.StartTimer({
      websocketPort: state.websocketPort,
      timerStartedAt: State.getTimerStartedAt(state),
      timerDuration: State.getTimerRemainingDuration(state),
    }),
];

export const SaveTimer = state => [
  state,
  effects.SaveTimer({
    externals: State.getExternals(state),
    timerId: State.getTimerId(state),
    shared: State.getShared(state),
  }),
];

export const SetTimerFromStorage = (state, { shared }) => [
  State.mergeShared(state, shared),
  effects.Act(ShareEverything),
];

export const DeleteTimer = state => [
  state,
  effects.DeleteTimer({
    externals: State.getExternals(state),
    timerId: State.getTimerId(state),
  }),
];

export const LoadTimer = state => [
  state,
  effects.LoadTimer({
    externals: State.getExternals(state),
    timerId: State.getTimerId(state),
    onLoad: SetTimerFromStorage,
  }),
];

export const SetOwnership = (state, isOwner) => {
  const { mob, goals } = State.getShared(state);
  const hasBeenModified = mob.length || goals.length;

  return [
    State.mergeLocal(state, { isOwner }),
    isOwner && !hasBeenModified && effects.Act(LoadTimer),
  ];
};
