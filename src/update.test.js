import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

test('can initialize state', (t) => {
  const [state, effect] = update(Action.Init(), undefined);
  t.deepEqual(state, { connections: [] });
  t.deepEqual(effect, effects.none());
});

test('can add a new connection', (t) => {
  const expected = { websocket: {}, timerId: 'foo', isOwner: true };
  const [state, effect] = update(
    Action.AddConnection(expected.websocket, expected.timerId),
    { connections: [] },
  );

  t.deepEqual(state, { connections: [expected] });
  t.deepEqual(effect, effects.none());
});

test('can remove an old connection', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const oldConnection = { websocket, timerId, isOwner: true };
  const [state, effect] = update(
    Action.RemoveConnection(websocket, timerId),
    { connections: [oldConnection] },
  );

  t.deepEqual(state, { connections: [] });
  t.deepEqual(effect, effects.none());
});

test('can message all users in a timer', (t) => {
  const makeConnection = (timerId) => ({
    websocket: { send: sinon.fake() },
    timerId,
    isOwner: false,
  });

  const targetTimer = 'foo';

  const shouldMessage = Array.from({ length: 5 }, () => makeConnection(
    targetTimer,
  ));
  const shouldntMessage = Array.from({ length: 5 }, () => makeConnection(
    Math.random().toString(36),
  ));

  const initialState = {
    connections: [
      ...shouldMessage,
      ...shouldntMessage,
    ],
  };

  const [state, effect] = update(
    Action.MessageTimer(shouldMessage[0].websocket, targetTimer, 'foo'),
    initialState,
  );

  t.is(state, initialState);
  t.deepEqual(effect.type, effects.thunk(() => {}).type);

  effect.method();

  t.falsy(shouldMessage[0].websocket.send.calledOnceWithExactly('foo'));
  shouldMessage.slice(1).forEach((connection) => {
    t.is(connection.websocket.send.callCount, 1);
  });
});
