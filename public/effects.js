import formatTime from '/formatTime.js';
import api from '/api.js';

const ApiEffectFX = (dispatch, {
  endpoint, options, token, OnOK, OnERR,
}) => api(endpoint, token, options)
  .then((r) => {
    if (!r.ok) {
      const error = new Error(`Status ${r.status}: ${r.statusText}`);
      error.response = r;
      throw error;
    }
    return r.json();
  })
  .then((data) => dispatch(OnOK, data))
  .catch((err) => dispatch(OnERR, err));
export const ApiEffect = (props) => [ApiEffectFX, props];


const NotificationPermissionFX = (dispatch, { SetAllowNotification }) => {
  if (!('Notification' in window)) {
    return;
  }
  Notification.requestPermission()
    .then((value) => {
      dispatch(SetAllowNotification, value === 'granted');
    })
    .catch((err) => {
      console.warn('Unable to ask for notification permission', err); // eslint-disable-line no-console
      dispatch(SetAllowNotification, false);
    });
};
export const NotificationPermission = (props) => [NotificationPermissionFX, props];


const DisplayNotificationFx = (_dispatch, { title, text }) => {
  if (!('Notification' in window)) {
    return;
  }
  new Notification(title, { // eslint-disable-line no-new
    body: text,
    vibrate: true,
  });
};
export const DisplayNotification = (props) => [DisplayNotificationFx, props];


const UpdateTitleWithTimeFX = (_dispatch, { remainingTime }) => {
  document.title = remainingTime > 0
    ? `${formatTime(remainingTime)} - mobtime`
    : 'mobtime';
};
export const UpdateTitleWithTime = (props) => [UpdateTitleWithTimeFX, props];


const OpenPromptFX = (dispatch, { title, OnValue, OnCancel }) => {
  setTimeout(() => {
    const value = window.prompt(title, ''); // eslint-disable-line no-alert
    return value
      ? dispatch(OnValue, value)
      : dispatch(OnCancel);
  }, 0);
};
export const OpenPrompt = (props) => [OpenPromptFX, props];
