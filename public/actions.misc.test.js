import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

test('can set websocket', t => {
  const websocket = { send: () => {} };
  const state = actions.SetWebsocket({}, { websocket });
  t.deepEqual(state, { websocket });
});

test('can set expand reorderable', t => {
  const expandedReorderable = { foo: 'bar' };
  const state = actions.ExpandReorderable({}, { expandedReorderable });
  t.deepEqual(state, { expandedReorderable });
});

test('can set timer tab', t => {
  const timerTab = 'foo-bar-baz';
  const state = actions.SetTimerTab({}, timerTab);
  t.deepEqual(state, { timerTab });
});

test('can allow notifications', t => {
  const Notification = {};
  const documentElement = {};
  const initialState = {
    externals: {
      Notification,
      documentElement,
    },
  };

  const [state, fx] = actions.SetAllowNotification(initialState, {
    allowNotification: true,
  });
  t.deepEqual(state, { ...initialState, allowNotification: true });
  t.deepEqual(
    fx,
    effects.Notify({
      title: 'Mobtime Config',
      text: 'You have allowed notifications',
      sound: false,
      Notification,
      documentElement,
    }),
  );
});

test('can disallow notifications', t => {
  const [state, fx] = actions.SetAllowNotification(
    {},
    {
      allowNotification: false,
      Notification: {},
      documentElement: {},
    },
  );
  t.deepEqual(state, { allowNotification: false });
  t.deepEqual(fx, false);
});

test('can set current time', t => {
  const currentTime = 47323743746;
  const documentElement = {};
  const initialState = {
    currentTime: 0,
    externals: { documentElement },
  };
  const [state, effect] = actions.SetCurrentTime(initialState, {
    currentTime,
  });

  const remainingTime = calculateTimeRemaining(state);

  t.deepEqual(state, {
    ...initialState,
    currentTime,
  });
  t.deepEqual(
    effect,
    effects.UpdateTitleWithTime({
      remainingTime,
      documentElement,
    }),
  );
});

test('can end turn', t => {
  const documentElement = {};
  const Notification = {};

  const initialState = {
    timerStartedAt: 1000,
    timerDuration: 10,
    allowNotification: true,
    allowSound: true,
    externals: {
      documentElement,
      Notification,
    },
  };

  const [state, ...effect] = actions.EndTurn(initialState, {});

  t.deepEqual(state, {
    ...initialState,
    timerStartedAt: null,
    timerDuration: 0,
  });

  t.deepEqual(effect, [
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      documentElement,
    }),
    effects.Notify({
      notification: initialState.allowNotification,
      sound: initialState.allowSound,
      title: 'Mobtime',
      text: 'The timer is up!',
      Notification,
      documentElement,
    }),
  ]);
});

test('it can toggle addMultiple', t => {
  const initialState = {
    addMultiple: false,
  };

  const state = actions.SetAddMultiple(initialState, true);

  t.deepEqual(state, {
    addMultiple: true,
  });
});
