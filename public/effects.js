/* eslint-disable prefer-arrow-callback */

import formatTime from './formatTime.js';

const fx = effect => props => [effect, props];

const sendMessage = (socketEmitter, type, json = {}) => {
  socketEmitter.emit(
    JSON.stringify({
      type,
      ...json,
    }),
  );
};

export const PreloadImage = fx(function PreloadImageFX(
  dispatch,
  { src, onLoad },
) {
  const img = new Image();

  img.onload = () => {
    console.log('Preloaded', src);
    dispatch(onLoad, { img });
  };

  img.onerror = event => {
    console.warn('Unable to preload image', src, event);
  };

  img.src = src;
});

export const UpdateSettings = fx(function UpdateSettingsFX(
  _dispatch,
  { socketEmitter, settings },
) {
  return sendMessage(socketEmitter, 'settings:update', { settings });
});

export const StartTimer = fx(function StartTimerFX(
  _dispatch,
  { socketEmitter, timerDuration },
) {
  return sendMessage(socketEmitter, 'timer:start', { timerDuration });
});

export const PauseTimer = fx(function StartTimerFX(
  _dispatch,
  { socketEmitter, timerDuration },
) {
  return sendMessage(socketEmitter, 'timer:pause', { timerDuration });
});

export const CompleteTimer = fx(function CompleteTimerFX(
  _dispatch,
  { socketEmitter },
) {
  return sendMessage(socketEmitter, 'timer:complete');
});

export const UpdateGoals = fx(function UpdateGoalsFX(
  _dispatch,
  { socketEmitter, goals },
) {
  sendMessage(socketEmitter, 'goals:update', { goals });
});

export const UpdateMob = fx(function UpdateMobFX(
  _dispatch,
  { socketEmitter, mob },
) {
  sendMessage(socketEmitter, 'mob:update', { mob });
});

export const NotificationPermission = fx(function NotificationPermissionFX(
  dispatch,
  { UpdateNotificationPermissions, Notification, documentElement },
) {
  const dispatchSetNotificationPermissions = notificationPermissions => {
    dispatch(UpdateNotificationPermissions, {
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
      dispatchSetNotificationPermissions('denied');
    });
});

function PlaySoundFX(_dispatch, { sound, documentElement }) {
  if (sound && documentElement) {
    const timerComplete = documentElement.querySelector('#timer-complete');
    timerComplete.play();
  }
}
export const PlaySound = fx(PlaySoundFX);

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
  PlaySoundFX(_dispatch, { sound, documentElement });
});

export const UpdateTitleWithTime = fx(function UpdateTitleWithTimeFX(
  _dispatch,
  { remainingTime, documentElement },
) {
  // eslint-disable-next-line no-param-reassign
  documentElement.title =
    remainingTime > 0 ? `${formatTime(remainingTime)} - mobtime` : 'mobtime';
});

export const andThen = fx(function andThenFX(dispatch, { action, props, delay }) {
  setTimeout(() => {
    dispatch(action, props);
  }, delay || 0);
});

export const checkSettings = fx(function CheckSettingsFX(
  dispatch,
  { storage, onLocalSoundEnabled, onDarkEnabled },
) {
  let localSettings = storage.getItem('settings');
  if (!localSettings) return;

  localSettings = JSON.parse(localSettings);
  if (localSettings.allowSound && onLocalSoundEnabled) {
    dispatch(onLocalSoundEnabled, {
      sound: localSettings.sound || '/audio/ding.wav',
    });
  }
  if (localSettings.dark && onDarkEnabled) {
    dispatch(onDarkEnabled, {
      dark: localSettings.dark,
    });
  }
});

export const saveSettings = fx(function SaveSettingsFX(
  _dispatch,
  { storage, data },
) {
  let localSettings = storage.getItem('settings');
  if (!localSettings) {
    localSettings = '{}';
  }

  localSettings = {
    ...JSON.parse(localSettings),
    ...data,
  };

  storage.setItem('settings', JSON.stringify(localSettings));
});

export const saveSound = fx(function SaveSoundFX(
  _dispatch,
  { storage, allowSound, sound },
) {
  let localSettings = storage.getItem('settings');
  if (!localSettings) {
    localSettings = '{}';
  }

  localSettings = {
    ...JSON.parse(localSettings),
    allowSound,
    sound,
  };

  storage.setItem('settings', JSON.stringify(localSettings));
});

export const toggleDarkMode = fx(function ToggleDarkMode(
  _dispatch,
  { documentElement, dark },
) {
  console.log('toggleDarkMode', documentElement, dark);
  if (typeof dark !== 'boolean') {
    console.log('dark not set, skipping', dark);
    return;
  }
  const classList = documentElement.querySelector('html').classList;
  if (classList.contains('dark') && !dark) {
    classList.remove('dark');
  }
  if (!classList.contains('dark') && dark) {
    classList.add('dark');
  }
});

export const removeQueryParameters = fx(function RemoveQueryParametersFX(
  _dispatch,
  { location, history, documentElement },
) {
  const paramsToKeep = ['lang'];
  const params = (location.toString().split('?')[1] || '')
    .split('&')
    .filter(keyValue =>
      paramsToKeep.some(toKeep => keyValue.startsWith(`${toKeep}=`)),
    )
    .join('&');
  history.replaceState(
    {},
    documentElement.title,
    [location.toString().split('?')[0], params].filter(Boolean).join('?'),
  );
});
