import test from 'ava';
import sinon from 'sinon';
import { app, effects } from 'ferp';
import * as Actions from './actions.js';

const runApp = (init, observe) => {
  const QuitApp = () => [null, effects.none()];

  const dispatch = app({
    init,
    observe,
  });

  return () => dispatch(QuitApp);
};

const fakeWebsocket = () => {
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

test('Adding two connections together does not duplicate id', t => {
  let lastState = null;
  const done = runApp(
    [
      { connections: [], statistics: {}, nextId: 'abc123' },
      effects.batch([
        effects.act(Actions.AddConnection, fakeWebsocket(), 'foo'),
        effects.act(Actions.AddConnection, fakeWebsocket(), 'bar'),
      ]),
    ],
    ([state]) => {
      lastState = state || lastState;
    },
  );

  done();

  t.not(lastState.connections[0].id, lastState.connections[1].id);
});
