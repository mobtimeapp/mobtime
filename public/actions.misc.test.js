import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

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

test('can set remaining timer', (t) => {
  const remainingTime = 12345;
  const [state, effect] = actions.SetRemainingTime({}, remainingTime);
  t.deepEqual(state, { remainingTime });
  t.deepEqual(effect, effects.UpdateTitleWithTime({ remainingTime }));
});
