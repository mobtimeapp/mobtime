import * as State from '../state.js';

export const calculateTimeRemaining = props => {
  const { startedAt, remainingDuration } = State.getTimer(props);
  const { time: currentTime } = State.getLocal(props);

  if (!timerStartedAt) {
    return timerDuration;
  }

  const elapsed = currentTime - timerStartedAt;
  return timerDuration > 0 ? Math.max(0, timerDuration - elapsed) : 0;
};
