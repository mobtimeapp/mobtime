import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can complete a timer', (t) => {
  const initialState = {
    timerStartedAt: Date.now(),
    timerDuration: 1,
    remainingTime: 1,
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: false });

  t.deepEqual(state, {
    timerStartedAt: null,
    timerDuration: 0,
    remainingTime: 0,
  });

  t.deepEqual(effect, [
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
    effects.ShareTimer(state),
  ]);
});

test('can complete a timer at the end of a turn and cycle when you are the owner', (t) => {
  const initialState = {
    isOwner: true,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: Date.now(),
    timerDuration: 1,
    remainingTime: 1,
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: true });

  t.deepEqual(state, {
    isOwner: true,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: null,
    timerDuration: 0,
    remainingTime: 0,
  });

  t.deepEqual(effect, [
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
    effects.ShareTimer(state),
    effects.Notify({
      title: 'Mobtime',
      notification: true,
      sound: false,
      text: 'The timer is up!',
    }),
    effects.andThen({
      action: actions.CycleMob,
      props: {},
    }),
  ]);
});

test('can complete a timer at the end of a turn but not cycle if you are not the owner', (t) => {
  const initialState = {
    isOwner: false,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: Date.now(),
    timerDuration: 1,
    remainingTime: 1,
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: true });

  t.deepEqual(state, {
    isOwner: false,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: null,
    timerDuration: 0,
    remainingTime: 0,
  });

  t.deepEqual(effect, [
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
    effects.ShareTimer(state),
    effects.Notify({
      title: 'Mobtime',
      notification: true,
      sound: false,
      text: 'The timer is up!',
    }),
  ]);
});

test('can pause the timer', (t) => {
  const websocket = {};

  const initialState = {
    websocket,
    timerStartedAt: Date.now(),
    timerDuration: 500,
    remainingTime: 100,
  };

  const [state, effect] = actions.PauseTimer(initialState);

  t.deepEqual(state, {
    websocket,
    timerStartedAt: null,
    timerDuration: 100,
    remainingTime: 100,
  });

  t.deepEqual(effect, effects.UpdateTimer({
    websocket,
    timerStartedAt: null,
    timerDuration: 100,
  }));
});

test('can resume the timer', (t) => {
  const now = Date.now();
  const beforeNow = now - 100000;
  const websocket = {};

  const initialState = {
    websocket,
    timerStartedAt: beforeNow,
    timerDuration: 1000000,
    remainingTime: 5000,
  };

  const [state, effect] = actions.ResumeTimer(initialState, now);

  t.deepEqual(state, {
    websocket,
    timerStartedAt: now,
    timerDuration: 5000,
    remainingTime: 5000,
  });

  t.deepEqual(effect, effects.UpdateTimer({
    websocket,
    timerStartedAt: now,
    timerDuration: 5000,
  }));
});

test('can start the timer', (t) => {
  const now = Date.now();
  const websocket = {};
  const timerDuration = 10000;

  const initialState = {
    websocket,
    settings: {
      duration: timerDuration,
    },
  };

  const [state, effect] = actions.StartTimer(initialState, now);

  t.deepEqual(state, {
    websocket,
    timerStartedAt: now,
    timerDuration,
    settings: {
      duration: timerDuration,
    },
  });

  t.deepEqual(effect, effects.UpdateTimer({
    websocket,
    timerStartedAt: now,
    timerDuration,
  }));
});
