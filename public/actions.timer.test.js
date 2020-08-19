import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can complete a timer', (t) => {
  const now = Date.now();
  const initialState = {
    timerStartedAt: now - 5,
    currentTime: now,
    timerDuration: 1,
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: false });

  t.deepEqual(state, {
    timerStartedAt: null,
    currentTime: now,
    timerDuration: 0,
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
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: true });

  t.deepEqual(state, {
    isOwner: true,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: null,
    timerDuration: 0,
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
  };

  const [state, effect] = actions.Completed(initialState, { isEndOfTurn: true });

  t.deepEqual(state, {
    isOwner: false,
    allowNotification: true,
    allowSound: false,
    timerStartedAt: null,
    timerDuration: 0,
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

  const expectedTimerDuration = 1000;
  const now = Date.now();
  const timerStartedAt = now - expectedTimerDuration;
  const currentTime = now - 5;

  const initialState = {
    websocket,
    timerStartedAt,
    currentTime,
    timerDuration: 2000,
  };

  const [state, effect] = actions.PauseTimer(initialState, now);

  t.deepEqual(state, {
    websocket,
    timerStartedAt: null,
    currentTime: now,
    timerDuration: expectedTimerDuration,
  });

  t.deepEqual(effect, effects.UpdateTimer({
    websocket,
    timerStartedAt: null,
    timerDuration: expectedTimerDuration,
  }));
});

test('can resume the timer', (t) => {
  const now = Date.now();
  const beforeNow = now - 100000;
  const websocket = {};

  const initialState = {
    websocket,
    timerStartedAt: beforeNow,
    currentTime: now,
    timerDuration: 1000000,
  };

  const [state, effect] = actions.ResumeTimer(initialState, now);

  t.deepEqual(state, {
    websocket,
    timerStartedAt: now,
    currentTime: now,
    timerDuration: 1000000,
  });

  t.deepEqual(effect, effects.UpdateTimer({
    websocket,
    timerStartedAt: now,
    timerDuration: 1000000,
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
