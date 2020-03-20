const CleanupSub = (storage, Action) => (dispatch) => {
  const lookForExpiredTimers = () => {
    const now = Date.now();
    const state = storage.read();
    const timerIds = Object.keys(state);
    let timerId;
    for(timerId of timerIds) {
      const timer = state[timerId];
      if (now > timer.expiresAt) {
        dispatch(Action.RemoveTimer(timerId));
      }
    }
  };

  const handle = setInterval(lookForExpiredTimers, 60000);

  return () => {
    clearInterval(handle);
  };
};
export const Cleanup = (...args) => [CleanupSub, ...args];
