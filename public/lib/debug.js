export const d = fn => {
  return (...args) => {
    console.groupCollapsed(fn, ...args);
    const result = fn(...args);
    console.log(result);
    console.groupEnd();
    return result;
  };
};
