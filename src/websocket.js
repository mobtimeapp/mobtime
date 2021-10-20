import { effects } from 'ferp';

const { none, thunk } = effects;

const WebsocketSub = (
  dispatch,
  actions,
  connection,
  redisPublisher,
  timerId,
) => {
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
        actions.SyncTimerToWebsocket(websocket, timerId),
        'SyncTimerToWebsocket',
      );
    }
    return redisPublisher.publish(timerId, data);
  });

  return () => {
    isClosed = true;
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

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
