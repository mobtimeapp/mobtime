import { effects } from 'ferp';

const { none, thunk, batch, defer } = effects;

const WEBSOCKET_TTL_SECONDS = 40;

const WebsocketSub = (dispatch, actions, connection, timerId) => {
  const initTime = Date.now();
  const log = (...data) =>
    console.log(`[WebsocketSub#${timerId}]`, connection.id, ...data);

  const { websocket } = connection;
  let pingSentAt = null;

  log('++ new connection');

  websocket.on('close', () => {
    log('closed');
    dispatch(
      actions.RemoveConnection(connection.id, timerId),
      'RemoveConnection',
    );
  });

  websocket.on('error', () => {
    log('error');
  });

  websocket.on('message', payload => {
    log('message', payload.toString());
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

  websocket.on('ping', () => {
    websocket.pong();
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
  }, WEBSOCKET_TTL_SECONDS * 1000);

  return () => {
    const totalTime = Date.now() - initTime;
    const hours = Math.floor(totalTime / 3600000);
    const minutes = Math.floor((totalTime - hours * 3600000) / 60000);
    log(`-- dropped connection after ${hours}h ${minutes}m`);
    websocket.close();
    clearInterval(intervalHandle);
  };
};
export const Websocket = (...props) => [WebsocketSub, ...props];

export const RelayMessage = (connection, message) =>
  thunk(() => {
    console.log(`[RelayMessage#${connection.timerId}]`, connection.id, message);
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
