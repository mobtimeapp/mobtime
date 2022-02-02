export const make = () => {
  const listeners = {};

  const stopListening = id => {
    delete listeners[id];
  };

  const listen = fn => {
    const id = [
      Date.now(),
      Math.random()
        .toString(36)
        .slice(2),
    ].join('-');
    listeners[id] = fn;
    return () => stopListening(id);
  };

  const emit = data => Object.values(listeners).forEach(fn => fn(data));

  return { emit, listen };
};
