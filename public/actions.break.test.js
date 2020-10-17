import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can finish a break', t => {
  const websocket = {};

  const initialState = {
    websocket,
  };

  const [state, effect] = actions.FinishBreak(initialState);

  t.is(state.breakTimerStartedAt, null);

  t.deepEqual(
    effect,
    effects.FinishBreak({
      websocket,
    }),
  );
});
