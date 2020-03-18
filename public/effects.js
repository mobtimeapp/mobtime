const ApiEffectFX = (dispatch, { endpoint, token, OnOK, OnERR }) => {
  const authHeaders = token
    ? { Authorization: `token ${token}` }
    : {};

  const headers = {
    Accept: 'application/json',
    ...authHeaders,
  };
    
  return fetch(endpoint, { headers })
    .then(r => {
      if (!r.ok) {
        const error = new Error(`Status ${r.status}: ${r.statusText}`);
        error.response = r;
        throw error;
      }
      return r.json();
    })
    .then(data => dispatch(OnOK, data))
    .catch(err => dispatch(OnERR, err));
};
export const ApiEffect = props => [ApiEffectFX, props];


const NotificationPermissionFX = (dispatch, { SetAllowNotification }) => {
  Notification.requestPermission()
    .then((value) => {
      dispatch(SetAllowNotification, value === 'granted');
    })
    .catch((err) => {
      console.warn('Unable to ask for notification permission', err);
      dispatch(SetAllowNotification, false);
    });
};
export const NotificationPermission = props => [NotificationPermissionFX, props];


const DisplayNotificationFx = (_dispatch, { title, text }) => {
  new Notification(title, {
    body: text,
    vibrate: true,
  });
};
export const DisplayNotification = props => [DisplayNotificationFx, props];
