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

  websocket.on('message', payload => {
    return dispatch(actions.UpdateTimer(timerId, payload), 'UpdateTimer');
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
