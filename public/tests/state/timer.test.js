import test from 'ava';

import * as State from '../../state.js';

test('manage the timer state', t => {
  const timerId = 'foo';
  const timerDuration = 100000;
  const reset = () =>
    State.setDuration(State.initial(timerId, {}), timerDuration);
  let state = reset();
  t.deepEqual(State.getTimer(state), {
    startedAt: null,
    remainingDuration: 0,
  });

  const elapsed = 60000;
  const elapsedLater = 1;
  const now = Date.now();
  const later = now + elapsed;
  const evenLater = later + elapsedLater;
  const earlier = now - elapsed;

  state = State.startTimer(reset(), now);
  t.deepEqual(State.getTimer(state), {
    startedAt: now,
    remainingDuration: timerDuration,
  });

  state = State.pauseTimer(State.startTimer(reset(), earlier), now);
  t.deepEqual(State.getTimer(state), {
    startedAt: null,
    remainingDuration: timerDuration - elapsed,
  });
  state = State.resumeTimer(state, later);
  t.deepEqual(State.getTimer(state), {
    startedAt: later,
    remainingDuration: timerDuration - elapsed,
  });
  t.deepEqual(
    State.timeRemainingFrom(State.setLocalCurrentTime(state, evenLater), state),
    timerDuration - elapsed - elapsedLater,
  );
});
