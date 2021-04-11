import { effects } from 'ferp';

const { none, thunk } = effects;

const WebsocketSub = (dispatch, actions, connection, timerId) => {
  const { websocket } = connection;

  let isClosed = false;
  websocket.on('close', () => {
    if (isClosed) return;
    isClosed = true;

    dispatch(actions.RemoveConnection(websocket, timerId), 'RemoveConnection');
  });

  websocket.on('message', data => {
    const { type } = JSON.parse(data);

    if (type === 'client:new') {
      return dispatch(
        actions.MessageTimerOwner(websocket, timerId, data),
        'MessageTimerOwner',
      );
    }

    return dispatch(
      actions.MessageTimer(websocket, timerId, data),
      'MessageTimer',
    );
  });

  return () => {
    isClosed = true;
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

export const SendOwnership = (connection, isOwner) =>
  thunk(() => {
    connection.websocket.send(
      JSON.stringify({
        type: 'timer:ownership',
        isOwner,
      }),
    );

    return none();
  });

export const CloseWebsocket = websocket =>
  thunk(() => {
    websocket.close();

    return none();
  });

export const RelayMessage = (connection, message) =>
  thunk(() => {
    connection.websocket.send(message);

    return none();
  });
