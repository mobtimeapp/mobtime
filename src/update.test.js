import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

test('can initialize state', (t) => {
  const [state, effect] = update(Action.Init(), undefined);
  t.deepEqual(state, { connections: [], statistics: {} });
  t.deepEqual(effect, effects.none());
});

test('can add a new connection', (t) => {
  const expected = { websocket: {}, timerId: 'foo', isOwner: true };
  const [state, effect] = update(
    Action.AddConnection(expected.websocket, expected.timerId),
    { connections: [], statistics: {} },
  );

  t.deepEqual(state, {
    connections: [expected],
    statistics: {
      foo: {
        connections: 1,
        goals: 0,
        mobbers: 0,
      },
    }
  });
  t.deepEqual(effect, effects.none());
});

test('can remove an old connection', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const oldConnection = { websocket, timerId, isOwner: true };
  const [state, effect] = update(
    Action.RemoveConnection(websocket, timerId),
    {
      connections: [oldConnection],
      statistics: {
        [timerId]: {
          connections: 1,
          mobbers: 0,
          goals: 0,
        },
      },
    },
  );

  t.deepEqual(state, {
    connections: [],
    statistics: {},
  });
  t.deepEqual(effect, effects.none());
});

test('can message all users in a timer', (t) => {
  const makeConnection = (timerId) => ({
    websocket: { send: sinon.fake() },
    timerId,
    isOwner: false,
  });

  const makeStatistics = (timerId, connections) => ({
    connections: connections.filter((c) => c.timerId === timerId).length,
    goals: 0,
    mobbers: 0,
  });

  const targetTimer = 'foo';

  const shouldMessage = Array.from({ length: 5 }, () => makeConnection(
    targetTimer,
  ));
  const shouldntMessage = Array.from({ length: 5 }, () => makeConnection(
    Math.random().toString(36),
  ));

  const connections = [...shouldMessage, ...shouldntMessage];
  const timerIds = Array.from(new Set(connections.map((c) => c.timerId)));

  const initialState = {
    connections,
    statistics: timerIds.reduce((memo, timerId) => ({
      ...memo,
      [timerId]: makeStatistics(timerId, connections),
    }), {}),
  };

  const message = JSON.stringify({
    type: 'foo',
  });

  const [state, effect] = update(
    Action.MessageTimer(shouldMessage[0].websocket, targetTimer, message),
    initialState,
  );

  t.deepEqual(state, initialState);
  t.deepEqual(effect.type, effects.thunk(() => {}).type);

  effect.method();

  t.falsy(shouldMessage[0].websocket.send.calledOnceWithExactly(message));
  shouldMessage.slice(1).forEach((connection) => {
    t.truthy(connection.websocket.send.calledOnceWithExactly(message));
  });
});
