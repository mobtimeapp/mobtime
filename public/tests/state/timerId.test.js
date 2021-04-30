import test from 'ava';

import * as State from '../../state.js';

test('manage the timer id', t => {
  const timerId = Math.random().toString(36);
  let state = State.initial(timerId, {});

  t.is(State.getTimerId(state), timerId);

  const updatedTimerId = 'foobar';
  state = State.setTimerId(state, updatedTimerId);
  t.is(State.getTimerId(state), updatedTimerId);

  t.snapshot(state);
});
