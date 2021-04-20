/* eslint-disable prefer-arrow-callback */

import formatTime from './lib/formatTime.js';
import * as port from './lib/port.js';
import * as giphy from './lib/giphy.js';

const fx = effect => props => [effect, props];

const sendMessage = (websocketPort, type, json = {}) => {
  port.expose(websocketPort).send({
    ...json,
    type,
  });
};

export const UpdateSettings = fx(function UpdateSettingsFX(
  _dispatch,
  { websocketPort, settings },
) {
  return sendMessage(websocketPort, 'settings:update', { settings });
});

export const BroadcastJoin = fx(function UpdateSettingsFX(
  _dispatch,
  { websocketPort },
) {
  return sendMessage(websocketPort, 'client:new');
});

export const StartTimer = fx(function StartTimerFX(
  _dispatch,
  { websocketPort, timerDuration },
) {
  return sendMessage(websocketPort, 'timer:start', { timerDuration });
});

export const PauseTimer = fx(function StartTimerFX(
  _dispatch,
  { websocketPort, timerDuration },
) {
  return sendMessage(websocketPort, 'timer:pause', { timerDuration });
});

export const CompleteTimer = fx(function CompleteTimerFX(
  _dispatch,
  { websocketPort },
) {
  return sendMessage(websocketPort, 'timer:complete');
});

export const UpdateGoals = fx(function UpdateGoalsFX(
  _dispatch,
  { websocketPort, goals },
) {
  return sendMessage(websocketPort, 'goals:update', { goals });
});

export const UpdateMob = fx(function UpdateMobFX(
  _dispatch,
  { websocketPort, mob },
) {
  return sendMessage(websocketPort, 'mob:update', { mob });
});

export const NotificationPermission = fx(function NotificationPermissionFX(
  dispatch,
  { SetNotificationPermissions, externals },
) {
  const dispatchSetNotificationPermissions = notificationPermissions => {
    dispatch(SetNotificationPermissions, {
      notificationPermissions,
      externals,
    });
  };

  if (!Notification) {
    dispatchSetNotificationPermissions('denied');
    return;
  }

  externals.Notification.requestPermission()
    .then(dispatchSetNotificationPermissions)
    .catch(() => {
      // eslint-disable-next-line no-console
      dispatchSetNotificationPermissions('denied');
    });
});

export const Notify = fx(function NotifyFX(
  _dispatch,
  { title, text, notification = true, sound = false, externals },
) {
  if (notification && externals.Notification) {
    // eslint-disable-next-line no-new
    new externals.Notification(title, {
      body: text,
      vibrate: [100, 100, 100],
    });
  }
  if (sound && externals.document) {
    const timerComplete = externals.document.querySelector('#timer-complete');
    timerComplete.play();
  }
});

export const UpdateTitleWithTime = fx(function UpdateTitleWithTimeFX(
  _dispatch,
  { remainingTime, externals },
) {
  // eslint-disable-next-line no-param-reassign
  externals.document.title =
    remainingTime > 0 ? `${formatTime(remainingTime)} - Mobtime` : 'Mobtime';
});

export const andThen = fx(function andThenFX(dispatch, { action, props }) {
  dispatch(action, props);
});

export const DeleteProfile = fx(function DeleteProfileFx(
  _dispatch,
  { externals },
) {
  externals.localStorage.removeItem('mobtime_profile');
});

export const LoadProfile = fx(function LoadProfileFx(
  dispatch,
  { externals, setProfile, init },
) {
  const profileString = externals.localStorage.getItem('mobtime_profile');

  const profile = profileString
    ? JSON.parse(profileString)
    : {
        firstTime: true,
        name: 'Anonymous Mobber',
        avatar: null,
        id: Math.random()
          .toString(36)
          .slice(2),
        enableSounds: false,
        enableNotifications: false,
      };

  dispatch(setProfile, { profile, init });
});

export const SaveProfile = fx(function SaveProfileFx(
  dispatch,
  { externals, profile, setProfile },
) {
  const { name, avatar, id, enableSounds, enableNotifications } = profile;

  const validatedProfile = {
    firstTime: false,
    name,
    avatar,
    id,
    enableSounds,
    enableNotifications,
  };

  externals.localStorage.setItem(
    'mobtime_profile',
    JSON.stringify(validatedProfile),
  );

  dispatch(setProfile, { profile: validatedProfile, init: false });
});

export const SearchGiphy = fx(function SearchGiphyFx(
  dispatch,
  { profile, giphySearch, setResults },
) {
  giphy
    .searchGifs(giphySearch)
    .then(results => {
      const current = { title: 'Saved Avatar', url: profile.avatar };
      const transformed = results.data.map(result => ({
        title: result.title,
        url: result.images.original.webp,
      }));
      dispatch(setResults, [current, ...transformed]);
    })
    .catch(error => {
      console.error('Oh no', error);
    });
});

export const Act = fx(function ActFx(dispatch, value) {
  const [action, props] = Array.isArray(value) ? value : [value, null];

  dispatch(action, props);
});
