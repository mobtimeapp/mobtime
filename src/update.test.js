import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

import * as Connection from './connection';

test('can initialize state', (t) => {
  const [state, effect] = update(Action.Init(), undefined);
  t.deepEqual(state, { connections: [], statistics: {} });
  t.deepEqual(effect, effects.none());
});

test('can message all users in a timer', (t) => {
  const targetTimer = 'foo';
  const message = JSON.stringify({ type: 'foo' });

  const messagerConnection = Connection.make({ send: sinon.fake() }, targetTimer);
  const shouldMessage = Array.from({ length: 5 }, () => (
    Connection.make({ send: sinon.fake() }, targetTimer)
  ));
  const shouldntMessage = Array.from({ length: 5 }, () => (
    Connection.make({ send: sinon.fake() }, `${targetTimer}-${Math.random().toString(36)}`)
  ));

  const connections = [
    messagerConnection,
    ...shouldMessage,
    ...shouldntMessage,
  ];

  const initialState = { connections };

  const [state, effect] = update(
    Action.MessageTimer(messagerConnection.getWebsocket(), messagerConnection.timerId, message),
    initialState,
  );

  t.deepEqual(state, initialState);
  t.is(effect.type, effects.batch([]).type);

  const { effects: batchedEffects } = effect;
  t.is(batchedEffects[0].type, effects.thunk().type);
  t.deepEqual(
    batchedEffects[1].valueOf(),
    Action.UpdateStatisticsFromMessage(targetTimer, message).valueOf(),
  );

  batchedEffects[0].method();

  shouldMessage.forEach((connection) => {
    t.truthy(connection.getWebsocket().send.calledOnceWithExactly(message));
  });
  shouldntMessage.concat(messagerConnection).forEach((connection) => {
    t.falsy(connection.getWebsocket().send.calledOnceWithExactly(message));
  });
});
