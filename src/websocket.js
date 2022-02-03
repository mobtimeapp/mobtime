import { effects } from 'ferp';

const { none, thunk, batch, defer } = effects;

const WebsocketSub = (dispatch, actions, connection, timerId) => {
  const { websocket } = connection;
  let pingSentAt = null;

  const log = (...data) =>
    console.log(`[WebsocketSub]`, connection.id, ...data);

  websocket.on('close', () => {
    dispatch(
      actions.RemoveConnection(connection.id, timerId),
      'RemoveConnection',
    );
  });

  websocket.on('message', payload => {
    return dispatch(
      actions.UpdateTimer(timerId, payload.toString()),
      'UpdateTimer',
    );
  });

  websocket.on('pong', () => {
    const latency = Date.now() - pingSentAt;
    pingSentAt = null;
    log('>> pong', `(latency=${latency}ms)`);
  });

  const intervalHandle = setInterval(() => {
    if (pingSentAt !== null) {
      log(
        '!! timeout',
        'client was not able to respond to ping within 60 seconds',
      );
      clearInterval(intervalHandle);
      websocket.close();
      return;
    }
    pingSentAt = Date.now();
    websocket.ping();
    log('<< ping');
  }, 60000);

  return () => {
    websocket.close();
    clearInterval(intervalHandle);
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
