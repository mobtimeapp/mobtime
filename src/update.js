import { effects } from 'ferp';
import Action from './actions';
import { id } from './id';
import { SendOwnership } from './websocket';

const defaultStatistics = {
  mobbers: 0,
  goals: 0,
  connections: 1,
};

const extractStatistics = (message) => {
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


export const update = (action, state) => Action.caseOf({
  Init: () => [
    {
      connections: [],
      statistics: {},
    },
    effects.none(),
  ],

  AddConnection: (websocket, timerId) => {
    const isOwner = state.connections.every((c) => c.timerId !== timerId);
    const connection = {
      id: id(),
      getWebsocket: () => websocket,
      timerId,
      isOwner,
    };

    return [
      {
        ...state,
        connections: state.connections.concat(connection),
        statistics: {
          ...state.statistics,
          [timerId]: {
            ...defaultStatistics,
            ...(state.statistics[timerId] || {}),
          },
        },
      },
      SendOwnership(connection),
    ];
  },

  RemoveConnection: (websocket, timerId) => {
    const connections = state.connections.filter((c) => c.getWebsocket() !== websocket);

    return [
      {
        ...state,
        connections,
      },
      effects.batch([
        effects.thunk(() => {
          websocket.close();
          return effects.none();
        }),
        Action.SetTimerOwner(timerId),
      ]),
    ];
  },

  MessageTimer: (websocket, timerId, message) => {
    const websockets = state.connections.reduce((sockets, connection) => {
      const differentTimer = connection.timerId !== timerId;
      const isOriginatingWebsocket = connection.getWebsocket() === websocket;
      if (differentTimer || isOriginatingWebsocket) {
        return sockets;
      }

      return [...sockets, connection.getWebsocket()];
    }, []);

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
      effects.thunk(() => {
        websockets.forEach((ws) => ws.send(message));
        return effects.none();
      }),
    ];
  },

  MessageTimerOwner: (websocket, timerId, message) => {
    const connection = state.connections.find((c) => (
      c.timerId === timerId && c.isOwner
    ));

    return [
      state,
      effects.thunk(() => {
        if (connection && connection.getWebsocket() !== websocket) {
          connection.getWebsocket().send(message);
        }
        return effects.none();
      }),
    ];
  },

  SetTimerOwner: (timerId) => {
    const targetIndex = state.connections.findIndex((c) => c.timerId === timerId);
    if (targetIndex < 0) {
      return [
        state,
        effects.none(),
      ];
    }

    const connections = state.connections.map((connection, index) => ({
      ...connection,
      isOwner: targetIndex === index ? true : connection.isOwner,
    }));

    const timerConnections = connections.filter((c, index) => (
      c.timerId === timerId
      && index !== targetIndex
    ));

    return [
      {
        ...state,
        connections,
      },
      effects.batch([
        SendOwnership(connections[targetIndex], true),
        ...timerConnections.map((tc) => SendOwnership(tc, false)),
      ]),
    ];
  },
}, action);
