import { effects } from 'ferp';

const { none, thunk, batch, defer } = effects;

const WebsocketSub = (dispatch, actions, connection, timerId) => {
  const { websocket } = connection;
  let waitingForPong = false;
  let isClosed = false;

  websocket.on('close', () => {
    if (isClosed) return;
    isClosed = true;

    dispatch(actions.RemoveConnection(websocket, timerId), 'RemoveConnection');
  });

  websocket.on('message', payload => {
    if (isClosed) return;
    return dispatch(actions.UpdateTimer(timerId, payload), 'UpdateTimer');
  });

  websocket.on('pong', () => {
    waitingForPong = false;
  });

  const intervalHandle = setInterval(() => {
    if (waitingForPong) {
      clearInterval(intervalHandle);
      websocket.close(0, 'Timeout');
      return;
    }
    websocket.ping();
    waitingForPong = true;
  }, 60000);

  return () => {
    websocket.close();
    clearInterval(intervalHandle);
    isClosed = true;
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

export const RelayMessage = (connection, message) =>
  thunk(() => {
    connection.websocket.send(message);

    return none();
  }, 'RelayMessage');

export const ShareMessage = (timerId, connections, message, queue) =>
  defer(
    queue.getTimer(timerId).then(timer => {
      const { type } = JSON.parse(message);
      if (
        type === 'timer:complete' &&
        !timer.timerStartedAt &&
        timer.timerDuration === 0
      ) {
        return none('ShareMessageNone');
      }

      return batch(
        connections.map(c => RelayMessage(c, message)),
        'ShareMessageBatch',
      );
    }),
    'ShareMessage',
  );
