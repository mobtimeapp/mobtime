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

export const PermitNotify = fx(function NotificationPermissionFX(
  _dispatch,
  { externals },
) {
  if (!externals.Notification) return;

  externals.Notification.requestPermission()
    .then(result => {
      console.log('set permissions', result);
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.warn('Unable to request notification permissions', e);
    });
});

export const Notify = fx(function NotifyFX(
  _dispatch,
  { title, text, silent, actions, externals },
) {
  if (!externals.Notification) return;

  // eslint-disable-next-line no-new
  new externals.Notification(title, {
    body: text,
    silent: !!silent,
    vibrate: [100, 100, 100],
  });
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

export const FocusInputAtEnd = fx(function FocusInputAtEndFx(
  _dispatch,
  selector,
) {
  setTimeout(() => {
    const e = document.querySelector(selector);
    if (!e) return;
    e.focus();
    const { value } = e;
    e.value = '';
    e.value = value;
  }, 100);
});

export const PlayHonk = fx(function PlayHonkFx(_dispatch, honk) {
  honk.play();
});

export const LoadLocal = fx(function LoadLocalFx(
  dispatch,
  { externals, onLoad },
) {
  const settingsStr = externals.localStorage.getItem('mobtime_config');
  const settings = settingsStr
    ? JSON.parse(settingsStr)
    : { autoSaveTimers: [] };

  dispatch(onLoad, settings);
});

export const SaveLocal = fx(function SaveLocalFx(
  _dispatch,
  { externals, local },
) {
  const { autoSaveTimers } = local;
  externals.localStorage.setItem(
    'mobtime_config',
    JSON.stringify({
      autoSaveTimers,
    }),
  );
});

export const DeleteTimer = fx(function SaveTimerFx(
  _dispatch,
  { externals, timerId },
) {
  externals.localStorage.removeItem(`mobtime_timer_${timerId}`);
});

export const SaveTimer = fx(function SaveTimerFx(
  _dispatch,
  { externals, timerId, shared },
) {
  externals.localStorage.setItem(
    `mobtime_timer_${timerId}`,
    JSON.stringify({ shared, _savedAt: Date.now() }),
  );
});

export const LoadTimer = fx(function LoadTimerFx(
  dispatch,
  { externals, timerId, onLoad },
) {
  const timerStr = externals.localStorage.getItem(`mobtime_timer_${timerId}`);
  if (!timerStr) return;

  const timer = JSON.parse(timerStr);
  dispatch(onLoad, timer);
});
