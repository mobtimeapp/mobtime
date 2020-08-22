import { effects } from 'ferp';

const WebsocketSub = (action, getWebsocket, timerId) => (dispatch) => {
  const websocket = getWebsocket();

  let isClosed = false;
  websocket.on('close', () => {
    if (isClosed) return;
    isClosed = true;

    dispatch(action.RemoveConnection(
      websocket,
      timerId,
    ));
  });

  websocket.on('message', (data) => {
    const { type } = JSON.parse(data);
    if (type === 'client:new') {
      return dispatch(action.MessageTimerOwner(websocket, timerId, data));
    }
    return dispatch(action.MessageTimer(websocket, timerId, data));
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
