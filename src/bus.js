export const make = () => {
  let fns = [];

  const emit = (...args) => {
    let fn;
    for (fn of fns) {
      if (!fn) continue;
      fn(...args);
    }
  };

  const resetFns = () => {
    const allNull = fns.every((fn) => !fn);
    if (!allNull) return;
    fns = [];
  };

  const subscribe = (fn) => {
    const index = fns.length;
    fns[index] = fn;
    return () => {
      fns[index] = null;
      resetFns();
    };
  };

  return {
    emit,
    subscribe,
  };
};
