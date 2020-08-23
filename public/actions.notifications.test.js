import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can request notification permission', (t) => {
  const initialState = {};
  const Notification = {};

  const [state, effect] = actions.RequestNotificationPermission(
    initialState,
    Notification,
  );

  t.is(state, initialState);
  t.deepEqual(effect, effects.NotificationPermission({
    SetNotificationPermissions: actions.SetNotificationPermissions,
    Notification,
  }));
});
