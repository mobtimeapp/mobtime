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

  setTimeout(tick, 0);

  return () => {
    cancel = true;
    clearTimeout(handle);
  };
};
export const Timer = props => [TimerFX, props];

const WebsocketFX = (dispatch, { actions }) => {
  const protocol = window.location.protocol === 'https:'
    ? 'wss'
    : 'ws';
  const websocketAddress = `${protocol}://${window.location.hostname}:${window.location.port}`;

  let socket = null;
  let handle = null;
  let cancel = false;

  const checkConnection = () => {
    return cancel
      ? null
      : fetch('/api/status')
        .then(r => {
          if (!r.ok) {
            socket.close();
          }
          handle = setTimeout(checkConnection, 10000);
        })
        .catch((err) => {
          if (socket) {
            socket.close();
          }
        });
  };

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

      dispatch(actions.SetWebsocketState, 'connected');

      socket.addEventListener('close', () => {
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
  checkConnection();

  return () => {
    cancel = true;
    clearTimeout(handle);
    socket.close();
    socket = null;
  };
};
export const Websocket = props => [WebsocketFX, props];
