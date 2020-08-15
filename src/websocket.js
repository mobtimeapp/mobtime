const WebsocketSub = (action, connection) => (dispatch) => {
  connection.websocket.on('close', () => {
    dispatch(action.RemoveConnection(connection.websocket, connection.timerId));
  });

  connection.websocket.on('message', (data) => {
    dispatch(action.MessageTimer(connection.websocket, connection.timerId, data));
  });

  return () => {
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];
