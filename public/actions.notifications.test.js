import test from 'ava';

import * as actions from './actions.js';
import * as effects from './effects.js';

test('can request notification permission', t => {
  const Notification = {};
  const documentElement = {};
  const initialState = {
    externals: {
      Notification,
      documentElement,
    },
  };

  const [state, fx] = actions.RequestNotificationPermission(initialState);

  t.is(state, initialState);
  t.deepEqual(
    fx,
    effects.NotificationPermission({
      UpdateNotificationPermissions: actions.UpdateNotificationPermissions,
      Notification,
      documentElement,
    }),
  );
});
