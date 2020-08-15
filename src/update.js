import { effects } from 'ferp';
import Action from './actions';

export const update = (action, state) => {
  if (!action) return [state, effects.none()];

  return Action.caseOf({
    Init: () => [
      {
        connections: [],
      },
      effects.none(),
    ],

    AddConnection: (websocket, timerId) => {
      const isOwner = state.connections.every((c) => c.timerId !== timerId);
      return [
        {
          ...state,
          connections: state.connections.concat({
            websocket,
            timerId,
            isOwner,
          }),
        },
        effects.none(),
      ];
    },

    RemoveConnection: (websocket, timerId) => {
      const timerConnections = state.connections.filter((c) => c.timerId === timerId);
      const target = timerConnections.find((c) => c.websocket === websocket);
      const nextOwner = target && target.isOwner
        ? timerConnections.find((c) => c.websocket !== websocket && !c.isOwner)
        : null;

      const connections = state.connections.reduce((memo, connection) => {
        if (connection === target) return memo;
        const nextConnection = connection === nextOwner
          ? { ...connection, isOwner: true }
          : connection;

        return [...memo, nextConnection];
      }, []);

      return [
        {
          ...state,
          connections,
        },
        effects.none(),
      ];
    },

    MessageTimer: (websocket, timerId, message) => {
      const websockets = state.connections.reduce((sockets, connection) => {
        const differentTimer = connection.timerId !== timerId;
        const isOriginatingWebsocket = connection.websocket === websocket;
        if (differentTimer || isOriginatingWebsocket) {
          return sockets;
        }

        return [...sockets, connection.websocket];
      }, []);

      return [
        state,
        effects.thunk(() => {
          websockets.forEach((ws) => ws.send(message));
          return effects.none();
        }),
      ];
    },

    MessageTimerOwner: (websocket, timerId, message) => {
      const connection = state.connections.find((connection) => {
        return connection.timerId === timerId
          && connection.isOwner;
      });

      return [
        state,
        effects.thunk(() => {
          if (connection.websocket !== websocket) {
            connection.websocket.send(message);
          }
          return effects.none();
        }),
      ];
    },
  }, action);
};
