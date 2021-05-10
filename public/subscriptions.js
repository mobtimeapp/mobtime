/* eslint-disable import/no-absolute-path, import/extensions, import/no-unresolved */
import * as port from './lib/port.js';

const TimerFX = (
  dispatch,
  { startedAt: timerStartedAt, remainingDuration: timerDuration, actions },
) => {
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
    });
    const elapsed = currentTime - timerStartedAt;

    if (elapsed >= timerDuration) {
      cleanup();
      dispatch(actions.Completed);
      dispatch(actions.EndTurn);
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

const WebsocketFX = (dispatch, { timerId, actions, websocketPort }) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const websocketAddress = `${protocol}://${window.location.hostname}:${window.location.port}/${timerId}`;

  let socket = null;
  let cancel = false;

  port.on(websocketPort, 'send', event => {
    if (cancel || !socket) return;
    socket.send(JSON.stringify(event.data));
  });

  const connect = () => {
    if (cancel) return;

    socket = new WebSocket(websocketAddress);

    const dispatchFromMessage = (type, action, props) => {
      dispatch(action, props);
      dispatch(actions.AppendMessage, { type });
    };

    socket.addEventListener('message', event => {
      const { type, ...data } = JSON.parse(event.data);
      switch (type) {
        case 'settings:update':
          return dispatchFromMessage(
            type,
            actions.ReplaceSettings,
            data.settings,
          );

        case 'timer:start':
          return dispatchFromMessage(type, actions.StartTimerAt, {
            startedAt: data.timerStartedAt,
            remainingDuration: data.timerDuration,
          });

        case 'timer:pause':
          return dispatchFromMessage(type, actions.PauseTimer, Date.now());

        case 'timer:complete':
          return dispatchFromMessage(type, actions.EndTurn);

        case 'goals:update':
          return dispatchFromMessage(type, actions.SetGoals, data.goals);

        case 'mob:update':
          return dispatchFromMessage(type, actions.SetMob, data.mob);

        case 'client:new':
          return dispatchFromMessage(type, actions.ShareEverything);

        case 'timer:ownership':
          return dispatchFromMessage(type, actions.SetOwnership, data.isOwner);

        default:
          console.warn('Unknown websocket data', event.data); // eslint-disable-line no-console
          return null;
      }
    });

    socket.addEventListener('open', () => {
      setTimeout(() => dispatch(actions.BroadcastJoin), 1);
    });

    socket.addEventListener('close', () => {
      socket = null;

      if (cancel) return;

      setTimeout(connect, 1000);
    });

    socket.addEventListener('error', event => {
      if (cancel) return;

      console.warn('Socket error', event);
    });
  };

  connect();

  return () => {
    cancel = true;
    socket.close();
  };
};
export const Websocket = props => [WebsocketFX, props];
