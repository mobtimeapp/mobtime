import * as port from './lib/port.js';

const moveArrayAtTo = (array, atIndex, toIndex) => {
  const lower = Math.min(atIndex, toIndex);
  const upper = Math.max(atIndex, toIndex);

  return []
    .concat(array.slice(0, lower))
    .concat(array[upper])
    .concat(array.slice(lower, upper))
    .concat(array[lower])
    .concat(array.slice(upper + 1));
};

const arrayCycle = array => array.slice(1).concat(array.slice(0, 1));

const arrayShuffle = (array, amount = 1, original = undefined) => {
  if (array.length <= 1) return array;
  if (array.length === 2) return arrayCycle(array);
  const previous = original || array;
  const value = [...array];
  for (let index = value.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.round(Math.random() * index);
    const old = value[index];
    value[index] = value[otherIndex];
    value[otherIndex] = old;
  }
  const isSame = previous.every((p, i) => p === value[i]);
  return isSame || amount > 1
    ? arrayShuffle(value, amount - 1, original)
    : value;
};

const statePipe = (fnWithArgs, initialState = {}) =>
  fnWithArgs.reduce((state, [fn, ...args]) => fn(state, ...args), initialState);

/* Timer id state */
export const getTimerId = state => state.timerId;
export const setTimerId = (state, timerId) => ({ ...state, timerId });

/* Local state */
export const getLocal = state => state.local;
export const setLocal = (state, local) => ({ ...state, local });
export const mergeLocal = (state, localPartial) =>
  setLocal(state, { ...state.local, ...localPartial });
export const setLocalCurrentTime = (state, time) => mergeLocal(state, { time });
export const getLocalCurrentTime = state => getLocal(state).time;
export const setLocalModal = (state, modal) => mergeLocal(state, { modal });
export const getLocalModal = state => getLocal(state).modal;
export const getLocalAutoSaveTimers = state =>
  getLocal(state).autoSaveTimers || [];
export const localAutoSaveTimerAdd = state => {
  const timerId = getTimerId(state);

  return mergeLocal(state, {
    autoSaveTimers: getLocalAutoSaveTimers(state)
      .filter(t => t !== timerId)
      .concat(timerId),
  });
};
export const localAutoSaveTimerRemove = state => {
  const timerId = getTimerId(state);
  return mergeLocal(state, {
    autoSaveTimers: getLocalAutoSaveTimers(state).filter(t => t !== timerId),
  });
};
export const isLocalAutoSaveTimer = state => {
  const timerId = getTimerId(state);
  return getLocalAutoSaveTimers(state).some(t => t === timerId);
};
export const setIsOwner = (state, isOwner) => mergeLocal(state, { isOwner });
export const getIsOwner = state => getLocal(state).isOwner;
export const getLocalHasLoaded = state => getLocal(state).hasLoaded;
export const setLocalHasLoaded = (state, hasLoaded) =>
  mergeLocal(state, { hasLoaded });
export const getLocalMessages = state => getLocal(state).messages || [];
export const appendLocalMessages = (state, message) =>
  getLocalHasLoaded(state)
    ? state
    : mergeLocal(state, { messages: getLocalMessages(state).concat(message) });
export const calculateIfAllLoaded = state => {
  if (getLocalHasLoaded(state)) return true;

  const expectedMessageTypes = getIsOwner(state)
    ? ['timer:ownership']
    : ['timer:ownership', 'mob:update', 'goals:update', 'settings:update'];

  const messages = getLocalMessages(state);
  return expectedMessageTypes.every(
    type => !!messages.find(m => m.type === type),
  );
};
export const setHasLoadedFromMessages = state =>
  setLocalHasLoaded(state, calculateIfAllLoaded(state));

/* Shared state */
export const getShared = state => state.shared;
export const setShared = (state, shared) => ({ ...state, shared });
export const mergeShared = (state, sharedPartial) =>
  setShared(state, { ...state.shared, ...sharedPartial });
export const getMob = state => getShared(state).mob;
export const setMob = (state, mob) => mergeShared(state, { mob });
export const isInMob = (state, id) => getMob(state).find(m => m.id === id);
export const cycleMob = state => setMob(state, arrayCycle(getMob(state)));
export const shuffleMob = state =>
  setMob(state, arrayShuffle(getMob(state), 5));
const getId = (id, name) =>
  id || `anonymous_${name.toLowerCase().replace(/[^a-z]/g, '_')}`;
export const addToMob = (state, name, avatar = null, id = null) =>
  setMob(state, getMob(state).concat({ id: getId(id, name), name, avatar }));
export const removeFromMob = (state, id) =>
  setMob(
    state,
    getMob(state).filter(m => m.id !== id),
  );
export const updateInMob = (state, participantPartial) =>
  setMob(
    state,
    getMob(state).map(m =>
      m.id === participantPartial.id ? { ...m, ...participantPartial } : m,
    ),
  );

export const getGoals = state => getShared(state).goals;
export const goalsNested = flattenedGoals =>
  flattenedGoals
    .filter(g => !g.parentId)
    .map(g => ({
      ...g,
      children: flattenedGoals.filter(cg => cg.parentId === g.id),
    }));
export const goalsFlattened = nestedGoals =>
  nestedGoals.reduce(
    (flattened, { children, ...goal }) => [...flattened, goal, ...children],
    [],
  );
export const goalsSorted = goals => goalsFlattened(goalsNested(goals));
export const setGoals = (state, goals) =>
  mergeShared(state, { goals: goalsSorted(goals) });
export const goalSetParent = (state, { goal, parent }) => {
  const goals = goalsNested(getGoals(state));
  const index = goals.findIndex(g => g.id === parent.id);
  if (index === false) {
    return state;
  }
  goals[index].children.push(goal);
  return setGoals(state, goalsFlattened(goals));
};
export const moveGoalUp = (state, goal) => {
  const goals = getGoals(state);
  const index = goals.findIndex(g => g.id === goal.id);
  const isFirstOrNotFound = !index;
  if (isFirstOrNotFound) return state;
  return setGoals(state, moveArrayAtTo(goals, index, index - 1));
};
export const moveGoalDown = (state, goal) => {
  const goals = getGoals(state);
  const index = goals.findIndex(g => g.id === goal.id);
  const notFound = index === false;
  const isAtEnd = index === goals.length - 1;
  if (notFound || isAtEnd) return state;
  return setGoals(state, moveArrayAtTo(goals, index, index + 1));
};
export const getPositions = state => getShared(state).positions;
export const setPositions = (state, positions) =>
  mergeShared(state, { positions });
export const getDuration = state => getShared(state).duration;
export const setDuration = (state, duration) =>
  mergeShared(state, { duration });

/* Timer state */
export const getTimer = state => state.timer;
export const setTimer = (state, timer) => ({ ...state, timer });
export const mergeTimer = (state, timerPartial) =>
  setTimer(state, { ...getTimer(state), ...timerPartial });
export const setTimerStartedAt = (state, startedAt) =>
  mergeTimer(state, { startedAt });
export const getTimerStartedAt = state => getTimer(state).startedAt;
export const setTimerRemainingDuration = (state, remainingDuration) =>
  mergeTimer(state, { remainingDuration });
export const getTimerRemainingDuration = state =>
  getTimer(state).remainingDuration;
export const endTurn = state =>
  statePipe(
    [
      [setTimerStartedAt, null],
      [setTimerRemainingDuration, 0],
    ],
    state,
  );
export const isPaused = state =>
  !getTimerStartedAt(state) && getTimerRemainingDuration(state) > 0;
export const calculateTimeRemaining = (state, currentTime) => {
  const remainingDuration = getTimerRemainingDuration(state);
  const startedAt = getTimerStartedAt(state);
  if (!startedAt) return remainingDuration;

  const elapsed = currentTime - startedAt;

  return remainingDuration > 0 ? Math.max(0, remainingDuration - elapsed) : 0;
};
export const pauseTimer = (state, currentTime) =>
  statePipe(
    [
      [setTimerStartedAt, null],
      [setTimerRemainingDuration, calculateTimeRemaining(state, currentTime)],
      [setLocalCurrentTime, currentTime],
    ],
    state,
  );
export const resumeTimer = (state, currentTime) =>
  isPaused(state)
    ? statePipe(
        [
          [setTimerStartedAt, currentTime],
          [setLocalCurrentTime, currentTime],
        ],
        state,
      )
    : state;
export const startTimer = (state, currentTime) => {
  const duration = getDuration(state);
  return statePipe(
    [
      [setTimerStartedAt, currentTime],
      [setTimerRemainingDuration, duration],
      [setLocalCurrentTime, currentTime],
    ],
    state,
  );
};
export const timeRemainingFrom = state =>
  calculateTimeRemaining(state, getLocalCurrentTime(state));

/* Profile state */
export const getProfile = state => state.profile;
export const setProfile = (state, profile) => ({ ...state, profile });
export const mergeProfile = (state, profilePartial) =>
  setProfile(state, { ...getProfile(state), ...profilePartial });

/* Toasts state */
export const getToasts = state => state.toasts;
export const setToasts = (state, toasts) => ({ ...state, toasts });
export const appendToasts = (state, toast) =>
  setToasts(state, getToasts(state).concat(toast));
export const dismissToastMessage = state =>
  setToasts(state, getToasts(state).slice(1));

/* Externals state */
export const getExternals = state => state.externals;
export const setExternals = (state, externals) => ({ ...state, externals });

/* Full application state */
export const initial = (timerId, externals = {}) =>
  statePipe(
    [
      [setTimerId, timerId],
      [setTimer, { startedAt: null, remainingDuration: 0 }],
      [
        setLocal,
        {
          time: null,
          isOwner: false,
          modal: null,
          giphySearch: '',
          giphyResults: [],
          autoSaveTimers: [],
          messageHistory: Array.from({ length: 5 }, () => null),
          hasLoaded: false,
        },
      ],
      [
        setShared,
        {
          mob: [],
          goals: [],
          positions: 'Navigator,Driver',
          duration: 5 * 60 * 1000 + 999,
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

export const addToGoals = (state, goal) =>
  setGoals(
    state,
    getGoals(state).concat({
      completed: false,
      ...goal,
    }),
  );

export const updateGoal = (state, id, text, parentId = null) =>
  setGoals(
    state,
    getGoals(state).map(g => (g.id === id ? { ...g, text, parentId } : g)),
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

export const isParticipantEditable = (state, participant) => {
  const profile = getProfile(state);
  const participantIsEmpty =
    !participant.id && !participant.name && !participant.avatar;
  const participantHasOwnerPrefix =
    (participant.id || '').startsWith(profile.id) &&
    participant.id !== profile.id;

  return getIsOwner(state) && (participantIsEmpty || participantHasOwnerPrefix);
};
