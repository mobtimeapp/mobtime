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

test('starts a break timer now if breaks are enabled', t => {
  const now = new Date();
  const websocket = {};
  const initialState = {
    breakTimerStartedAt: null,
    currentTime: now,
    settings: {
      breaksEnabled: true,
    },
    websocket,
  };

  const [state, effect] = actions.StartBreakTimer(initialState);

  t.is(state.breakTimerStartedAt, now);
  t.deepEqual(
    effect,
    effects.StartBreakTimer({
      websocket,
    }),
  );
});

test('does not start a break timer if breaks are disabled', t => {
  const initialState = {
    settings: {
      breaksEnabled: false,
    },
  };

  const [state, effect] = actions.StartBreakTimer(initialState);

  t.is(state.breakTimerStartedAt, initialState.breakTimerStartedAt);
  t.is(effect, undefined);
});

test('does not start a break timer if one is already running', t => {
  const initialState = {
    breakTimerStartedAt: new Date(),
    settings: {
      breaksEnabled: true,
    },
  };

  const [state, effect] = actions.StartBreakTimer(initialState);

  t.is(state.breakTimerStartedAt, initialState.breakTimerStartedAt);
  t.is(effect, undefined);
});
