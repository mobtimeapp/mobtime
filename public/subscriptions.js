/* eslint-disable import/no-absolute-path, import/extensions, import/no-unresolved */

const TimerFX = (dispatch, { timerStartedAt, timerDuration, actions }) => {
  let cancel = false;
  let handle = null;

  const cleanup = () => {
    cancel = true;
    clearTimeout(handle);
  };

  const tick = () => {
    if (cancel) return;

    const currentTime = Date.now();
    dispatch(actions.SetCurrentTime, {
      currentTime,
      documentElement: document,
    });
    const elapsed = currentTime - timerStartedAt;

    if (elapsed >= timerDuration) {
      cleanup();
      dispatch(actions.Completed, {
        isEndOfTurn: true,
        documentElement: document,
        Notification: window.Notification,
      });
      return;
    }

    handle = setTimeout(tick, 100);
  };

  if (timerStartedAt) {
    handle = setTimeout(tick, 0);
  }

  return cleanup;
};
export const Timer = props => [TimerFX, props];

const WebsocketFX = (dispatch, { timerId, externals, actions }) => {
  const protocol = externals.location.protocol === 'https:' ? 'wss' : 'ws';
  const websocketAddress = `${protocol}://${externals.location.hostname}:${externals.location.port}/${timerId}`;

  const socket = new WebSocket(websocketAddress);
  let hasError = false;

  socket.addEventListener('message', event => {
    console.log('websocket message', event.data);

    const payload = JSON.parse(event.data);

    dispatch(actions.UpdateByWebsocketData, {
      payload,
      documentElement: document,
      Notification: window.Notification,
    });
  });

  socket.addEventListener('close', event => {
    if (hasError) return;
    console.warn('Socket closed', event);
    dispatch(actions.WebsocketDisconnected, 'Oops, the websocket disconnected');
  });

  socket.addEventListener('error', event => {
    hasError = true;
    console.warn('Socket error', event);
    dispatch(actions.WebsocketDisconnected, 'Websocket connection error');
  });

  return () => {
    socket.close();
  };
};
export const Websocket = props => [WebsocketFX, props];

const DragAndDropFX = (dispatch, props) => {
  const onMove = event => {
    dispatch(props.DragMove, {
      clientX: event.pageX,
      clientY: event.pageY,
    });
  };

  const onMouseUp = event => {
    if (props.active) {
      event.preventDefault();
    }
    dispatch(props.DragEnd);
  };

  const onKeyUp = event => {
    if (event.key !== 'Escape') {
      return;
    }
    dispatch(props.DragCancel);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('mouseup', onMouseUp);

  return () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keyup', onKeyUp);
  };
};
export const DragAndDrop = props => [DragAndDropFX, props];
