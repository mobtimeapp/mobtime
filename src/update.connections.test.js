import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

import * as Connection from './connection';

test('can add a new connection', (t) => {
  const timerId = 'fskjbnfdgk';
  const { id, getWebsocket, ...expected } = Connection.make({}, timerId);

  const initialState = {
    connections: [],
  };

  const [state, effect] = update(
    Action.AddConnection(expected.websocket, expected.timerId),
    initialState,
  );

  t.like(state.connections[0], expected);
  t.deepEqual(effect.type, effects.batch([]).type);

  const { effects: batchedEffects } = effect;

  t.deepEqual(
    batchedEffects[0].valueOf(),
    Action.SetTimerOwner(timerId).valueOf(),
  );
  t.deepEqual(
    batchedEffects[1].valueOf(),
    Action.UpdateStatisticsFromConnections(timerId).valueOf(),
  );
});

test('can remove an old connection', (t) => {
  const websocket = { close: sinon.fake() };
  const timerId = 'foo';
  const oldConnection = Connection.make(websocket, timerId, true);

  const initialState = {
    connections: [oldConnection],
  };

  const [state, effect] = update(
    Action.RemoveConnection(websocket, timerId),
    initialState,
  );

  t.deepEqual(state, {
    connections: [],
  });
  t.is(effect.type, effects.batch([]).type);

  const { effects: batchedEffects } = effect;

  t.is(batchedEffects[0].type, effects.thunk(() => {}).type);
  t.deepEqual(
    batchedEffects[1].valueOf(),
    Action.SetTimerOwner(timerId).valueOf(),
  );
  t.deepEqual(
    batchedEffects[2].valueOf(),
    Action.UpdateStatisticsFromConnections(timerId).valueOf(),
  );

  const thunkEffect = batchedEffects[0].method();
  t.deepEqual(thunkEffect, effects.none());

  t.truthy(websocket.close.calledOnceWithExactly());
});

