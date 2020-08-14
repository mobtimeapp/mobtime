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

    RemoveConnection: (websocket) => [
      {
        ...state,
        connections: state.connections.filter((connection) => (
          websocket !== connection.websocket
        )),
      },
      effects.none(),
    ],

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
  }, action);
};
