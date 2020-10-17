/* eslint-disable import/no-absolute-path, import/extensions, import/no-unresolved */
import { roundToSeconds } from './lib/roundToSeconds.js';

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
      currentTime: roundToSeconds(currentTime),
      documentElement: document,
    });
    const elapsed = roundToSeconds(currentTime) - timerStartedAt;

    if (timerStartedAt !== null && elapsed >= timerDuration) {
      dispatch(actions.Completed, {
        isEndOfTurn: true,
        documentElement: document,
        Notification: window.Notification,
      });
    }

    handle = setTimeout(tick, 100);
  };

  handle = setTimeout(tick, 0);

  return cleanup;
};
export const Timer = props => [TimerFX, props];

const WebsocketFX = (dispatch, { timerId, actions }) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const websocketAddress = `${protocol}://${window.location.hostname}:${window.location.port}/${timerId}`;

  let socket = null;
  let cancel = false;

  const connect = async () => {
    if (cancel) return;

    dispatch(actions.SetWebsocket, { websocket: null });
    socket = new WebSocket(websocketAddress);

    socket.addEventListener('open', () => {
      dispatch(actions.SetWebsocket, { websocket: socket });
      dispatch(actions.BroadcastJoin);
    });

    socket.addEventListener('message', event => {
      const payload = JSON.parse(event.data);

      dispatch(actions.UpdateByWebsocketData, {
        payload,
        documentElement: document,
        Notification: window.Notification,
      });
    });

    socket.addEventListener('close', () => {
      if (cancel) return;

      setTimeout(connect, 1000);
    });

    socket.addEventListener('error', event => {
      if (cancel) return;

      console.warn('Socket error', event);
    });
  };

  requestAnimationFrame(() => {
    connect();
  });

  return () => {
    cancel = true;

    dispatch(actions.SetWebsocket, { websocket: null });

    socket.close();
    socket = null;
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
