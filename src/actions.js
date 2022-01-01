import { effects } from 'ferp';
import { CloseWebsocket, RelayMessage } from './websocket';
import * as Connection from './connection';
import { id, GenerateIdEffect } from './id';

const { none, act, batch, defer } = effects;

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
    connections: [],
    queue,
    nextId,
  },
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

export const SetTimerTTL = (timerId, ttl) => state => [
  state,
  defer(state.queue.setTimerTtl(timerId, ttl)),
];

export const UpdateConnectionStatistics = timerId => state => [
  state,
  defer(resolve => {
    const connections = state.connections.filter(c => c.timerId === timerId)
      .length;

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

export const AddConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.concat(
      Connection.make(state.nextId, websocket, timerId),
    ),
  },
  batch([
    GenerateIdEffect(SetNextId),
    act(UpdateConnectionStatistics(timerId)),
    act(ShareTimerWith(websocket, timerId)),
    defer(state.queue.setTimerTtl(timerId, -1).then(none)),
  ]),
];

export const RemoveConnection = (websocket, timerId) => state => {
  const connections = state.connections.filter(c => c.websocket !== websocket);
  return [
    {
      ...state,
      connections,
    },
    batch([
      CloseWebsocket(websocket),
      act(UpdateConnectionStatistics(timerId)),
      connections.length > 0
        ? none()
        : defer(state.queue.setTimerTtl(timerId, 60 * 24 * 3).then(none)),
    ]),
  ];
};

export const UpdateTimer = (timerId, message) => state => {
  const { type, ...data } = JSON.parse(message);

  const meta = {
    ...(type === 'timer:start' ? { timerStartedAt: Date.now() } : {}),
    ...(type === 'timer:complete' ? { timerStartedAt: null } : {}),
    ...(type === 'timer:pause' ? { timerStartedAt: null } : {}),
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
      defer(
        state.queue
          .publishToTimer(timerId, message)
          .then(none)
      ),
      act(UpdateStatisticsFromMessage(timerId, message)),
    ]),
  ];
};

export const MessageTimer = (timerId, message) => state => [
  state,
  effects.batch(
    state.connections
      .filter(c => c.timerId === timerId)
      .map(c => RelayMessage(c, message)),
  ),
];

export const ShareTimerWith = (websocket, timerId) => state => [
  state,
  effects.defer(
    state.queue
      .getTimer(timerId)
      .then(timer => {
        if (!timer) return;

        const sync = key => {
          websocket.send(
            JSON.stringify({
              type: `${key}:update`,
              [key]: timer[key] || defaultTimer[key],
            }),
          );
        };

        sync('settings');
        sync('mob');
        sync('goals');

        if (timer.timerStartedAt) {
          websocket.send(
            JSON.stringify({
              type: 'timer:update',
              timerStartedAt: timer.timerStartedAt,
              timerDuration: timer.timerDuration,
            }),
          );
        }
      })
      .then(none),
  ),
];
