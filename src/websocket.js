import { effects } from 'ferp';

const WebsocketSub = (action, connection) => (dispatch) => {
  const websocket = connection.getWebsocket();

  let isClosed = false;
  websocket.on('close', () => {
    if (isClosed) return;
    isClosed = true;

    dispatch(action.RemoveConnection(
      websocket,
      connection.timerId,
    ));
  });

  websocket.on('message', (data) => {
    const { type } = JSON.parse(data);
    if (type === 'client:new') {
      return dispatch(action.MessageTimerOwner(connection.websocket, connection.timerId, data));
    }
    return dispatch(action.MessageTimer(connection.websocket, connection.timerId, data));
  });

  return () => {
    isClosed = true;
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

export const SendOwnership = (connection) => effects.thunk(() => {
  const websocket = connection.getWebsocket();

  websocket.send(JSON.stringify({
    type: 'timer:ownership',
    isOwner: connection.isOwner,
  }));

  return effects.none();
});
