import { effects } from 'ferp';
import { SendOwnership, CloseWebsocket, RelayMessage } from './websocket';
import * as Connection from './connection';
import { id, GenerateIdEffect } from './id';
import { CacheTimerState } from './redis';

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

export const SetTimerOwner = timerId => state => {
  const hasConnectionsOnTimerId = state.connections.some(
    c => c.timerId === timerId,
  );
  if (!hasConnectionsOnTimerId) {
    return [state, effects.none()];
  }

  const [timerOwner, ...timerOthers] = state.connections.filter(
    c => c.timerId === timerId,
  );

  return [
    state,
    batch([
      SendOwnership(timerOwner, true),
      ...timerOthers.map(tc => SendOwnership(tc, false)),
    ]),
  ];
};

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
    // Update Redis cache for given timer
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

export const AddConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.concat(
      Connection.make(state.nextId, websocket, timerId),
    ),
  },
  batch([
    GenerateIdEffect(SetNextId),
    // act(SetTimerOwner, timerId),
    act(UpdateStatisticsFromConnections, timerId),
  ]),
];

export const RemoveConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.filter(c => c.websocket !== websocket),
  },
  batch([
    CloseWebsocket(websocket),
    // act(SetTimerOwner, timerId),
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
      ...connections.map(c => RelayMessage(c, message)),
      act(UpdateStatisticsFromMessage, timerId, message),
      CacheTimerState(state.redisConnection, message, timerId),
    ]),
  ];
};
