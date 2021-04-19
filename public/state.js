import * as port from './lib/port.js';

const statePipe = (fnWithArgs, initialState = {}) =>
  fnWithArgs.reduce((state, [fn, ...args]) => fn(state, ...args), initialState);

export const getTimerId = state => state.timerId;
export const setTimerId = (state, timerId) => ({ ...state, timerId });

export const getLocal = state => state.local;
export const setLocal = (state, local) => ({ ...state, local });
export const mergeLocal = (state, localPartial) =>
  setLocal(state, { ...state.local, ...localPartial });
export const setCurrentTime = (state, time) => mergeLocal(state, { time });
export const setModal = (state, modal) => mergeLocal(state, { modal });

export const getShared = state => state.shared;
export const setShared = (state, shared) => ({ ...state, shared });
export const mergeShared = (state, sharedPartial) =>
  setShared(state, { ...state.shared, ...sharedPartial });

export const getTimer = state => state.timer;
export const setTimer = (state, timer) => ({ ...state, timer });
export const mergeTimer = (state, timerPartial) =>
  setTimer(state, { ...state.timer, ...timerPartial });
export const endTurn = state =>
  mergeTimer(state, { timerStartedAt: null, timerDuration: 0 });
export const isPaused = state => getTimer(state).timerStartedAt === null;
export const timeRemainingFrom = state => {
  const { timerDuration, timerStartedAt } = getTimer(state);

  if (!timerStartedAt) {
    return timerDuration;
  }

  const { time } = getLocal(state);

  const elapsed = time - timerStartedAt;
  return timerDuration > 0 ? Math.max(0, timerDuration - elapsed) : 0;
};

export const getMob = state => getShared(state).mob;
export const setMob = (state, mob) => mergeShared(state, { mob });

export const getGoals = state => getShared(state).goals;
export const setGoals = (state, goals) => mergeShared(state, { goals });

export const getPositions = state => getShared(state).positions;
export const setPositions = (state, positions) =>
  mergeShared(state, { positions });

export const getDuration = state => getShared(state).duration;
export const setDuration = (state, duration) =>
  mergeShared(state, { duration });

export const getProfile = state => state.profile;
export const setProfile = (state, profile) => ({ ...state, profile });
export const mergeProfile = (state, profilePartial) =>
  setProfile(state, { ...getProfile(state), ...profilePartial });

export const getToasts = state => state.toasts;
export const setToasts = (state, toasts) => ({ ...state, toasts });
export const appendToasts = (state, toast) =>
  setToasts(state, getToasts(state).concat(toast));
export const dismissToastMessage = state =>
  setToasts(state, getToasts(state).slice(1));

export const getExternals = state => state.externals;
export const setExternals = (state, externals) => ({ ...state, externals });

export const initial = (timerId, externals = {}) =>
  statePipe(
    [
      [setTimerId, timerId],
      [setTimer, { timerStartedAt: null, timerDuration: 0 }],
      [
        setLocal,
        {
          time: null,
          isOwner: false,
          modal: null,
          giphySearch: '',
          giphyResults: [],
        },
      ],
      [
        setShared,
        {
          mob: [],
          goals: [],
          positions: 'Navigator,Driver',
          duration: 5 * 60 * 1000,
        },
      ],
      [setProfile, null],
      [setToasts, []],
      [setExternals, externals],
    ],
    {
      websocketPort: port.make(['send']),
    },
  );

export const cycleMob = state => {
  const oldMob = getMob(state);
  if (oldMob.length === 0) return state;

  return setMob(state, oldMob.slice(1).concat(oldMob[0]));
};
export const shuffleMob = state => {
  const mob = [...getMob(state)];
  for (let index = mob.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.round(Math.random() * index);
    const old = mob[index];
    mob[index] = mob[otherIndex];
    mob[otherIndex] = old;
  }

  return setMob(state, mob);
};

export const addToMob = (state, name, avatar = null) => {
  return setMob(
    state,
    getMob(state).concat({
      id: Math.ranom()
        .toString(36)
        .slice(2),
      name,
      avatar,
    }),
  );
};

export const removeFromMob = (state, id) =>
  setMob(
    state,
    getMob(state).filter(m => m.id !== id),
  );

export const addToGoals = (state, goal) =>
  setGoals(
    state,
    getGoals(state).concat({
      id: Math.random()
        .toString(36)
        .slice(2),
      text: goal,
      completed: false,
    }),
  );

export const completeGoal = (state, id, completed = true) =>
  setGoals(
    state,
    getGoals(state).map(g => (g.id === id ? { ...g, completed } : g)),
  );

export const removeGoal = (state, id) =>
  setGoals(
    state,
    getGoals(state).filter(g => g.id !== id),
  );

export const removeCompletedGoals = state =>
  setGoals(
    state,
    getGoals(state).filter(g => !g.completed),
  );

export const editGoal = (state, id, text) =>
  setGoals(
    state,
    getGoals(state).map(g => (g.id === id ? { ...g, text } : g)),
  );

export const pauseTimer = (state, currentTime) => {
  const { timerStartedAt, timerDuration } = getTimer(state);
  const elapsed = currentTime - timerStartedAt;

  return mergeTimer(state, {
    timerStartedAt: null,
    timerDuration: Math.max(0, timerDuration - elapsed),
  });
};

export const resumeTimer = (state, timerStartedAt) =>
  mergeTimer(state, {
    timerStartedAt,
  });

export const startTimer = (state, currentTime, timerDuration) =>
  mergeTimer(state, {
    timerDuration,
    timerStartedAt: currentTime,
  });

export const pendingSettingsReset = state => ({
  ...state,
  pendingSettings: {},
});

export const pendingSettingSet = (state, key, value) => ({
  ...state,
  pendingSettings: {
    ...state.pendingSettings,
    [key]: value,
  },
});

export const mergePendingSettingsIntoSettings = state => ({
  ...state,
  settings: { ...state.settings, ...state.pendingSettings },
});

export const setSettings = (state, settings) => ({ ...state, settings });
export const getSettings = state => state.settings;

export const setIsOwner = (state, isOwner) => ({ ...state, isOwner });
