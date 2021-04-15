/* eslint-disable prefer-arrow-callback */

import formatTime from './formatTime.js';

const fx = effect => props => [effect, props];

const sendMessage = (websocket, type, json = {}) => {
  websocket.send(
    JSON.stringify({
      type,
      ...json,
    }),
  );
};

export const UpdateSettings = fx(function UpdateSettingsFX(
  _dispatch,
  { websocket, settings },
) {
  return sendMessage(websocket, 'settings:update', { settings });
});

export const BroadcastJoin = fx(function UpdateSettingsFX(
  _dispatch,
  { websocket },
) {
  return sendMessage(websocket, 'client:new');
});

export const StartTimer = fx(function StartTimerFX(
  _dispatch,
  { websocket, timerDuration },
) {
  return sendMessage(websocket, 'timer:start', { timerDuration });
});

export const PauseTimer = fx(function StartTimerFX(
  _dispatch,
  { websocket, timerDuration },
) {
  return sendMessage(websocket, 'timer:pause', { timerDuration });
});

export const CompleteTimer = fx(function CompleteTimerFX(
  _dispatch,
  { websocket },
) {
  return sendMessage(websocket, 'timer:complete');
});

export const UpdateGoals = fx(function UpdateGoalsFX(
  _dispatch,
  { websocket, goals },
) {
  websocket.send(
    JSON.stringify({
      type: 'goals:update',
      goals,
    }),
  );
});

export const UpdateMob = fx(function UpdateMobFX(
  _dispatch,
  { websocket, mob },
) {
  websocket.send(
    JSON.stringify({
      type: 'mob:update',
      mob,
    }),
  );
});

export const NotificationPermission = fx(function NotificationPermissionFX(
  dispatch,
  { SetNotificationPermissions, Notification, documentElement },
) {
  const dispatchSetNotificationPermissions = notificationPermissions => {
    dispatch(SetNotificationPermissions, {
      notificationPermissions,
      Notification,
      documentElement,
    });
  };

  if (!Notification) {
    dispatchSetNotificationPermissions('denied');
    return;
  }

  Notification.requestPermission()
    .then(dispatchSetNotificationPermissions)
    .catch(() => {
      // eslint-disable-next-line no-console
      dispatchSetNotificationPermissions('denied');
    });
});

export const Notify = fx(function NotifyFX(
  _dispatch,
  {
    title,
    text,
    notification = true,
    sound = false,
    Notification,
    documentElement,
  },
) {
  if (notification && Notification) {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body: text,
      vibrate: [100, 100, 100],
    });
  }
  if (sound && documentElement) {
    const timerComplete = documentElement.querySelector('#timer-complete');
    timerComplete.play();
  }
});

export const UpdateTitleWithTime = fx(function UpdateTitleWithTimeFX(
  _dispatch,
  { remainingTime, documentElement },
) {
  // eslint-disable-next-line no-param-reassign
  documentElement.title =
    remainingTime > 0 ? `${formatTime(remainingTime)} - mobtime` : 'mobtime';
});

export const andThen = fx(function andThenFX(dispatch, { action, props }) {
  dispatch(action, props);
});

export const LoadProfile = fx(function LoadProfileFx(
  dispatch,
  { localStorage, onLoad },
) {
  const profileString = localStorage.getItem('mobtime_profile');
  const profile = profileString
    ? JSON.parse(profileString)
    : {
        firstTime: true,
        name: 'Anonymous Mobber',
        avatar: null,
        id: Math.random()
          .toString(36)
          .slice(2),
      };

  if (!profileString) {
    localStorage.setItem(
      'mobtime_profile',
      JSON.stringify({ ...profile, firstTime: false }),
    );
  }

  console.log('LoadProfile', profile);

  dispatch(onLoad, profile);
});
