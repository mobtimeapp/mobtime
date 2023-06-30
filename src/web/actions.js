import { effects } from 'ferp';
import { WebSocket } from 'ws';
import { RelayMessage, ShareMessage } from './websocket.js';
import * as Connection from './connection.js';
import { id, GenerateIdEffect } from './id.js';
import { composable, select, selectArray, replace } from 'composable-state';

const { none, act, batch, defer, thunk } = effects;

const defaultStatistics = {
  connections: 0,
  mobbers: 0,
};

const defaultTimer = {
  mob: [],
  goals: [],
  settings: {
    mobOrder: 'Navigator,Driver',
    duration: 5 * 60 * 1000,
  },
};

const extractStatistics = message => {
  const { type, ...data } = JSON.parse(message);

  switch (type) {
    case 'mob:update':
      return { mobbers: data.mob.length };
    default:
      return {};
  }
};

export const Init = (queue, nextId = id()) => [
  {
    completeTokens: {},
    connections: {},
    queue,
    nextId,
  },
  none(),
];

export const SetCompleteToken = (timerId, token) => state => [
  composable(state, selectArray(['completeTokens', timerId], replace(token))),
  none(),
];

export const RemoveCompleteToken = timerId => state => [
  composable(state, select('completeTokens', replace((old) => {
    const clone = { ...old };
    delete clone[timerId];
    return clone;
  }))),
  none(),
];

export const SetNextId = nextId => state => [{ ...state, nextId }, none()];

export const UpdateStatisticsFromMessage = (timerId, message) => state => [
  state,
  defer(
    state.queue
      .mergeStatistics(timerId, stats => ({
        ...defaultStatistics,
        ...stats,
        ...extractStatistics(message),
      }))
      .then(none),
  ),
];

export const UpdateConnectionStatistics = timerId => state => [
  state,
  defer(resolve => {
    const connections = (state.connections[timerId] || []).length;

    if (connections === 0) {
      return state.queue
        .getStatistics()
        .then(({ [timerId]: oldTimer, ...otherTimers }) => otherTimers)
        .then(stats => state.queue.setStatistics(stats))
        .then(none)
        .then(resolve);
    }

    return state.queue
      .mergeStatistics(timerId, stats => ({
        ...defaultStatistics,
        ...stats,
        connections,
      }))
      .then(none)
      .then(resolve);
  }),
];

export const AddConnection = (websocket, timerId) => state => {
  const connection = Connection.make(state.nextId, websocket, timerId);
  return [
    {
      ...state,
      connections: {
        ...state.connections,
        [timerId]: (state.connections[timerId] || []).concat(connection),
      },
    },
    batch([
      GenerateIdEffect(SetNextId),
      act(UpdateConnectionStatistics(timerId), 'UpdateConnectionStatistics'),
      act(ShareTimerWith(connection, timerId), 'ShareTimerWith'),
    ]),
  ];
};

export const RemoveConnection = (connectionId, timerId) => state => {
  const timerConnections = (state.connections[timerId] || [])
    .filter(c => c.id !== connectionId)
    .filter(c => c.websocket.readyState !== WebSocket.CLOSED);
  const { [timerId]: current, ...others } = state.connections;

  return [
    {
      ...state,
      connections:
        timerConnections.length > 0
          ? { ...others, [timerId]: current }
          : others,
    },
    act(UpdateConnectionStatistics(timerId), 'UpdateConnectionStatistics'),
  ];
};

export const UpdateTimer = (timerId, message) => state => {
  const { type, ...data } = JSON.parse(message);

  const meta = {
    ...(type === 'timer:start' ? { timerStartedAt: Date.now() } : {}),
    ...(type === 'timer:complete' ? { timerStartedAt: null, timerDuration: 0 } : {}),
  };

  return [
    state,
    batch([
      defer(
        state.queue
          .mergeTimer(timerId, timer => ({
            ...timer,
            ...data,
            ...meta,
          }))
          .then(none),
      ),
      defer(state.queue.publishToTimer(timerId, message).then(none)),
      act(UpdateStatisticsFromMessage(timerId, message)),
    ]),
  ];
};

export const CompleteTimer = (timerId, token, statusCallback) => state => {
  if (state.completeTokens[timerId] !== token) {
    statusCallback(false);
    return [state, none()];
  }

  return [
    state,
    batch([
      act(RemoveCompleteToken(timerId)),
      act(UpdateTimer(timerId, JSON.stringify({ type: 'timer:complete' }))),
      thunk(() => {
        statusCallback(true);
        return none();
      }),
    ]),
  ];
};

export const PauseTimer = (timerId, token, duration) => state => {
  if (state.completeTokens[timerId] !== token) {
    return [state, none()];
  }

  return [
    state,
    batch([
      //defer(state.queue.publishToTimer(timerId, JSON.stringify({ type: 'timer:pause', timerDuration: duration })).then(none)),
      act(RemoveCompleteToken(timerId)),
      act(UpdateTimer(timerId, JSON.stringify({ type: 'timer:pause', timerStartedAt: null, timerDuration: duration }))),
    ]),
  ];
};

export const MessageTimer = (timerId, message) => state => {
  return [
    state,
    ShareMessage(
      timerId,
      state.connections[timerId] || [],
      message,
      state.queue,
    ),
  ];
};

export const ShareTimerWith = (connection, timerId) => state => [
  state,
  effects.defer(
    state.queue.getTimer(timerId).then(timer => {
      if (!timer) return;

      const sync = (key, payload) =>
        RelayMessage(
          connection,
          JSON.stringify(
            payload || {
              type: `${key}:update`,
              [key]: timer[key] || defaultTimer[key],
            },
          ),
        );

      const timerData = {
        type: 'timer:update',
        timerStartedAt: timer.timerStartedAt,
        timerDuration: timer.timerDuration,
        completeToken: state.completeTokens[timerId] || null,
      };

      const timerEndsAt = timer.timerStartedAt + timer.timerDuration;
      if (Date.now() > timerEndsAt) {
        timerData.timerStartedAt = null;
        timerData.timerDuration = 0;
        timerData.completeToken = null;
      }

      return batch([
        sync('settings'),
        sync('mob'),
        sync('goals'),
        sync('timer', timerData),
        sync('connections', {
          type: 'connections:update',
          count: state.connections[timerId].length,
        }),
      ]);
    }),
  ),
];
