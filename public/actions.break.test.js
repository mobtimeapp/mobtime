import test from 'ava';

import * as actions from './actions';

test('starts the break timer if breaks are enabled', t => {
  const websocket = {};
  const now = new Date();

  const initialState = {
    breakTimerStartedAt: null,
    currentTime: now,
    settings: {
      breaksEnabled: true,
    },
    websocket,
  };

  const [state] = actions.StartBreakTimer(initialState);

  t.like(state, {
    breakTimerStartedAt: now,
  });
});

test('does not start the break timer if breaks are disabled', t => {
  const websocket = {};

  const initialState = {
    settings: {
      breaksEnabled: false,
    },
    websocket,
  };

  const [state] = actions.StartBreakTimer(initialState);

  t.deepEqual(state, initialState);
});
