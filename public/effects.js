/* eslint-disable prefer-arrow-callback */

import formatTime from './formatTime.js';

const fx = (effect) => (props) => [effect, props];

const sendMessage = (websocket, type, json = {}) => {
  websocket.send(JSON.stringify({
    type,
    ...json,
  }));
};

export const UpdateSettings = fx(function UpdateSettingsFX(_dispatch, {
  websocket,
  settings,
}) { return sendMessage(websocket, 'settings:update', {settings});});

export const BroadcastJoin = fx(function UpdateSettingsFX(_dispatch, {
  websocket,
}) { return sendMessage(websocket, 'client:new');});

export const StartTimer = fx(function StartTimerFX(_dispatch, {
  websocket,
  timerDuration,
}) { return sendMessage(websocket, 'timer:start', {timerDuration});});

export const PauseTimer = fx(function StartTimerFX(_dispatch, {
  websocket,
  timerDuration,
}) { return sendMessage(websocket, 'timer:pause', {timerDuration});});

export const CompleteTimer = fx(function CompleteTimerFX(_dispatch, {
  websocket,
}) { return sendMessage(websocket, 'timer:complete');});

export const UpdateGoals = fx(function UpdateGoalsFX(_dispatch, {
  websocket,
  goals,
}) {
  websocket.send(JSON.stringify({
    type : 'goals:update',
    goals,
  }));
});

export const UpdateMob = fx(function UpdateMobFX(_dispatch, {
  websocket,
  mob,
}) {
  websocket.send(JSON.stringify({
    type : 'mob:update',
    mob,
  }));
});

export const NotificationPermission =
    fx(function NotificationPermissionFX(dispatch, {
      SetNotificationPermissions,
      Notification,
    }) {
      if (!Notification) {
        dispatch(SetNotificationPermissions, 'denied');
        return;
      }

      if (Notification.permission) {
        requestAnimationFrame(() => {
          dispatch(SetNotificationPermissions, Notification.permission);
        });
        return;
      }

      console.log(Notification.permission);

      Notification.requestPermission()
          .then((value) => { dispatch(SetNotificationPermissions, value); })
          .catch((err) => {
            console.warn('Unable to ask for notification permission',
                         err); // eslint-disable-line no-console
            dispatch(SetNotificationPermissions, '');
          });
    });

export const Notify = fx(function NotifyFX(_dispatch, {
  title,
  text,
  notification = true,
  sound = false,
  Notification,
  documentElement,
}) {
  if (notification && Notification) {
    const n = new Notification(title, {
      // eslint-disable-line no-new
      body : text,
      vibrate : [ 100, 100, 100 ],
    });
  }
  if (sound && documentElement) {
    const timerComplete = documentElement.querySelector('#timer-complete');
    timerComplete.play();
  }
});

export const UpdateTitleWithTime =
    fx(function UpdateTitleWithTimeFX(_dispatch, {
      remainingTime,
      documentElement,
    }) {
      documentElement.title =
          remainingTime > 0 // eslint-disable-line no-param-reassign
              ? `${formatTime(remainingTime)} - mobtime`
              : 'mobtime';
    });

export const andThen = fx(function andThenFX(
    dispatch, {action, props}) { dispatch(action, props);});
