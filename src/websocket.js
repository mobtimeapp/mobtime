import { effects, sub } from 'ferp';

const { act, none, thunk } = effects;

const WebsocketSub = (dispatch, action, connection, timerId) => {
  const { websocket } = connection;

  let isClosed = false;
  websocket.on('close', () => {
    if (isClosed) return;
    isClosed = true;

    dispatch(action.RemoveConnection(websocket, timerId), 'RemoveConnection');
  });

  websocket.on('message', data => {
    const { type } = JSON.parse(data);

    if (type === 'client:new') {
      return dispatch(
        action.MessageTimerOwner(websocket, timerId, data),
        'MessageTimerOwner',
      );
    }

    return dispatch(
      action.MessageTimer(websocket, timerId, data),
      'MessageTimer',
    );
  });

  return () => {
    isClosed = true;
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

export const SendOwnership = connection =>
  thunk(() => {
    connection.websocket.send(
      JSON.stringify({
        type: 'timer:ownership',
        isOwner: connection.isOwner,
      }),
    );

    return none();
  });

export const CloseWebsocket = websocket =>
  thunk(() => {
    websocket.close();

    return none();
  });
