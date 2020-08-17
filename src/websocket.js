const WebsocketSub = (action, connection) => (dispatch) => {
  connection.websocket.on('close', () => {
    dispatch(action.RemoveConnection(connection.websocket, connection.timerId));
  });

  connection.websocket.on('message', (data) => {
    const { type } = JSON.parse(data);
    if (type === 'client:new') {
      return dispatch(action.MessageTimerOwner(connection.websocket, connection.timerId, data));
    }
    return dispatch(action.MessageTimer(connection.websocket, connection.timerId, data));
  });

  connection.websocket.send(JSON.stringify({
    type: 'timer:ownership',
    isOwner: connection.isOwner,
  }));

  return () => {
    connection.websocket.close();
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];
