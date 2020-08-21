import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

test('can set websocket', (t) => {
  const websocket = { send: () => {} };
  const state = actions.SetWebsocket({}, { websocket });
  t.deepEqual(state, { websocket });
});

test('can set expand reorderable', (t) => {
  const expandedReorderable = { foo: 'bar' };
  const state = actions.ExpandReorderable({}, { expandedReorderable });
  t.deepEqual(state, { expandedReorderable });
});

test('can set timer tab', (t) => {
  const timerTab = 'foo-bar-baz';
  const state = actions.SetTimerTab({}, timerTab);
  t.deepEqual(state, { timerTab });
});

test('can set allow notification', (t) => {
  const state = actions.SetAllowNotification({}, true);
  t.deepEqual(state, { allowNotification: true });
});

test('can set current time', (t) => {
  const currentTime = 47323743746;
  const [state, effect] = actions.SetCurrentTime({}, currentTime);

  const remainingTime = calculateTimeRemaining(state);

  t.deepEqual(state, { currentTime });
  t.deepEqual(effect, effects.UpdateTitleWithTime({ remainingTime }));
});
