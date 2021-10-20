import { effects } from 'ferp';
import { CloseWebsocket, RelayMessage } from './websocket';
import * as Connection from './connection';
import { id, GenerateIdEffect } from './id';
import { WriteCacheTimerState, ShareCacheTimerState } from './redis';

const { none, act, batch } = effects;

const defaultStatistics = {
  mobbers: 0,
  goals: 0,
  connections: 0,
};

const extractStatistics = message => {
  const { type, ...data } = JSON.parse(message);

  switch (type) {
    case 'goals:update':
      return { goals: data.goals.length };

    case 'mob:update':
      return { mobbers: data.mob.length };

    default:
      return {};
  }
};

export const Init = (nextId = id()) => [
  {
    connections: [],
    statistics: {},
    nextId,
    redisConnection: null,
  },
  none(),
];

export const SetRedisConnection = redisConnection => state => [
  { ...state, redisConnection },
  none(),
];

export const SetNextId = nextId => state => [{ ...state, nextId }, none()];

export const UpdateStatisticsFromMessage = (timerId, message) => state => {
  const statistics = {
    ...state.statistics,
    [timerId]: {
      ...defaultStatistics,
      ...state.statistics[timerId],
      ...extractStatistics(message),
    },
  };

  return [
    {
      ...state,
      statistics,
    },
    none(),
  ];
};

export const UpdateStatisticsFromConnections = timerId => state => {
  const connections = state.connections.filter(
    connection => connection.timerId === timerId,
  );

  const { [timerId]: old, ...prevStatistics } = state.statistics;

  const augment =
    connections.length > 0
      ? {
          [timerId]: {
            ...defaultStatistics,
            ...old,
            connections: connections.length,
          },
        }
      : {};

  const statistics = {
    ...prevStatistics,
    ...augment,
  };

  return [
    {
      ...state,
      statistics,
    },
    none(),
  ];
};

export const AddConnection = (websocket, timerId) => state => {
  const connection = Connection.make(state.nextId, websocket, timerId);
  return [
    {
      ...state,
      connections: state.connections.concat(connection),
    },
    batch([
      GenerateIdEffect(SetNextId),
      act(UpdateStatisticsFromConnections, timerId),
      ShareCacheTimerState(connection, state.redisConnection, timerId),
    ]),
  ];
};

export const RemoveConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.filter(c => c.websocket !== websocket),
  },
  batch([
    CloseWebsocket(websocket),
    act(UpdateStatisticsFromConnections, timerId),
  ]),
];

export const MessageTimer = (timerId, message) => state => {
  const connections = state.connections.filter(
    connection => connection.timerId === timerId,
  );

  return [
    state,
    effects.batch([
      // ...connections.map(c => RelayMessage(c, message)),
      // act(UpdateStatisticsFromMessage, timerId, message),
      // WriteCacheTimerState(state.redisConnection, message, timerId),
    ]),
  ];
};

export const SyncTimerToWebsocket = (websocket, timerId) => state => [
  state,
  ShareCacheTimerState({ websocket }, state.redisConnection, timerId),
];
