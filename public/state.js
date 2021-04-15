export const initial = (timerId, initialNotificationPermission) => ({
  isOwner: false,
  timerStartedAt: null,
  timerDuration: 0,
  mob: [],
  goals: [],
  settings: {
    mobOrder: 'Navigator,Driver,Next',
    duration: 5 * 60 * 1000,
  },
  toastMessages: [],
  profile: null,
  timerId,
  currentTime: null,
  name: '',
  goal: '',
  allowSound: false,
  allowNotification: initialNotificationPermission === 'granted',
  notificationPermissions: initialNotificationPermission,
  websocket: null,
});

export const dismissToastMessage = state => ({
  ...state,
  toastMessages: state.toastMessages.slice(1),
});

export const setCurrentTime = (state, currentTime) => ({
  ...state,
  currentTime,
});

export const setWebsocket = (state, websocket) => ({
  ...state,
  websocket,
});

export const endTurn = state => ({
  ...state,
  timerStartedAt: null,
  timerDuration: 0,
});

export const getMob = state => state.mob;
export const setMob = (state, mob) => ({ ...state, mob });

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

export const getGoals = state => state.goals;
export const setGoals = (state, goals) => ({ ...state, goals });

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
  const elapsed = currentTime - state.timerStartedAt;
  const timerDuration = Math.max(0, state.timerDuration - elapsed);

  return {
    ...state,
    timerStartedAt: null,
    timerDuration,
    currentTime,
  };
};

export const resumeTimer = (state, currentTime) => ({
  ...state,
  timerStartedAt: currentTime,
  currentTime,
});

export const startTimer = (state, currentTime, timerDuration) =>
  resumeTimer(
    {
      ...state,
      timerDuration,
    },
    currentTime,
  );

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
