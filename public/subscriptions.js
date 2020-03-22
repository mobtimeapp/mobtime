import api from '/api.js';

const TimerFX = (dispatch, { timerStartedAt, timerDuration, actions }) => {
  let cancel = false;
  let handle = null;

  const tick = () => {
    if (cancel) return;

    const now = Date.now();
    const elapsed = now - timerStartedAt;
    const remaining = Math.max(0, timerDuration - elapsed);

    dispatch(actions.SetRemainingTime, remaining);
    if (remaining === 0) {
      return dispatch(actions.Completed);
    }

    handle = setTimeout(tick, 100);
  };

  if (timerStartedAt) {
    handle = setTimeout(tick, 0);
  }

  return () => {
    cancel = true;
    clearTimeout(handle);
  };
};
export const Timer = props => [TimerFX, props];

const KeepAliveFX = (_dispatch, { token }) => {
  let cancel = false;
  let handle = null;

  const checkConnection = () => {
    return cancel
      ? null
      : api('/api/ping', token)
        .then(r => {
          if (!r.ok) {
            const error = new Error(`HTTP Status ${r.status}: ${r.statusText}`);
            error.response = r;
            throw error;
          }
          handle = setTimeout(checkConnection, 5 * 60 * 1000);
        })
        .catch((err) => {
          console.warn('Unable to ping timer', err);
        });
  };

  setTimeout(checkConnection, 0);

  return () => {
    cancel = true;
    clearTimeout(handle);
  };
};
export const KeepAlive = props => [KeepAliveFX, props];


const WebsocketFX = (dispatch, { timerId, actions }) => {
  console.log('Opening websocket subscription', timerId);
  const protocol = window.location.protocol === 'https:'
    ? 'wss'
    : 'ws';
  const websocketAddress = `${protocol}://${window.location.hostname}:${window.location.port}`;

  let socket = null;
  let cancel = false;

  const connect = () => {
    if (cancel) {
      return;
    }

    socket = new WebSocket(websocketAddress);

    dispatch(actions.SetWebsocketState, 'connecting');
    let connectionAttempt = setTimeout(() => {
      socket.close();
    }, 10000);

    socket.addEventListener('open', () => {
      clearTimeout(connectionAttempt);

      socket.send(timerId);

      dispatch(actions.SetWebsocketState, 'connected');

      socket.addEventListener('close', (event) => {
        console.log('websocket disconnected', event);
        dispatch(actions.SetWebsocketState, 'disconnected');
        socket = null;
        setTimeout(connect, 10000);
      });
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.token) {
        dispatch(actions.SetToken, message.token);
      }

      dispatch(actions.Tick, message.state);
    });
  };

  setTimeout(connect, 0);

  return () => {
    cancel = true;
    socket.close();
    socket = null;
  };
};
export const Websocket = props => [WebsocketFX, props];
