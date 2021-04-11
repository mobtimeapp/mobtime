export const memoize = (fn, memorySize = 1) => {
  const memory = [];

  return (...params) => {
    const key = JSON.stringify(params);
    const item = memory.find(m => m.key === key);
    if (item) {
      return item.value;
    }

    const newItem = {
      key,
      value: fn(...params),
    };

    if (memory.push(newItem) > memorySize) {
      memory.shift();
    }

    return newItem.value;
  };
};
