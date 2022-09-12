import * as sinon from 'sinon';

export const fakeSocket = () => {
  const events = {};
  const getEvents = name => events[name] || [];

  const on = (name, cb) => {
    events[name] = getEvents(name).concat(cb);
  };
  const trigger = (name, event) => getEvents(name).forEach(cb => cb(event));

  return {
    send: sinon.fake(),
    close: sinon.fake(),
    on,
    trigger,
  };
};
