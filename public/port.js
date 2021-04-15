const onKey = Symbol('on');
const offKey = Symbol('off');
const exposeKey = Symbol('expose');

export const make = eventNames => {
  const listeners = eventNames.reduce(
    (memo, eventName) => ({
      ...memo,
      [eventName]: [],
    }),
    {},
  );

  const off = (eventName, method) => {
    listeners[eventName] = listeners[eventName].filter(m => m !== method);
  };

  const on = (eventName, method) => {
    listeners[eventName] = listeners[eventName].concat(method);
    return () => off(eventName, method);
  };

  const call = (eventName, data) => {
    const event = { eventName, timestamp: Date.now(), data };
    listeners[eventName].forEach(fn => fn(event));
  };

  const expose = eventNames.reduce(
    (memo, eventName) => ({
      ...memo,
      [eventName]: data => call(eventName, data),
    }),
    {},
  );

  return {
    [onKey]: on,
    [offKey]: off,
    [exposeKey]: Object.freeze({ ...expose }),
  };
};

export const on = (port, eventName, method) => port[onKey](eventName, method);
export const off = (port, eventName, method) => port[offKey](eventName, method);
export const expose = port => port[exposeKey];
