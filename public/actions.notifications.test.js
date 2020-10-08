import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can request notification permission', t => {
  const initialState = {};
  const Notification = {};
  const documentElement = {};

  const [state, fx] = actions.RequestNotificationPermission(initialState, {
    Notification,
    documentElement,
  });

  t.is(state, initialState);
  t.deepEqual(
    fx,
    effects.NotificationPermission({
      SetNotificationPermissions: actions.SetNotificationPermissions,
      Notification,
      documentElement,
    }),
  );
});
