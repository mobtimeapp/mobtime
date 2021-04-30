import test from 'ava';

import * as State from '../../state.js';

test('creates an initial state', t => {
  t.snapshot(State.initial('test-timer', {}));
});
