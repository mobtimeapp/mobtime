import { effects } from 'ferp';
import { SendOwnership, CloseWebsocket } from './websocket';
import * as Connection from './connection';

const { none, act, batch, thunk } = effects;

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

export const Init = () => [
  {
    connections: [],
    statistics: {},
  },
  none(),
];

export const SetTimerOwner = timerId => state => {
  const targetIndex = state.connections.findIndex(c => c.timerId === timerId);
  if (targetIndex < 0) {
    return [state, effects.none()];
  }

  const connections = state.connections.map((connection, index) => ({
    ...connection,
    isOwner: targetIndex === index ? true : connection.isOwner,
  }));

  const timerConnections = connections.filter(
    (c, index) => c.timerId === timerId && index !== targetIndex,
  );

  return [
    {
      ...state,
      connections,
    },
    batch([
      SendOwnership(connections[targetIndex], true),
      ...timerConnections.map(tc => SendOwnership(tc, false)),
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
    connections: state.connections.concat(Connection.make(websocket, timerId)),
  },
  batch([
    act(SetTimerOwner, timerId),
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
    act(SetTimerOwner, timerId),
    act(UpdateStatisticsFromConnections, timerId),
  ]),
];

export const MessageTimer = (websocket, timerId, message) => state => {
  const connections = state.connections.filter(
    connection =>
      connection.timerId === timerId && connection.websocket !== websocket,
  );

  return [
    state,
    effects.batch([
      effects.thunk(() => {
        connections.forEach(connection => {
          connection.websocket.send(message);
        });
        return none();
      }),
      act(UpdateStatisticsFromMessage, timerId, message),
    ]),
  ];
};

export const MessageTimerOwner = (websocket, timerId, message) => state => {
  const owner = state.connections.find(
    c => c.timerId === timerId && c.isOwner && c.websocket !== websocket,
  );

  return [
    state,
    owner
      ? thunk(() => {
          owner.websocket.send(message);
          return none();
        })
      : none(),
  ];
};
