import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

import * as Connection from './connection';

test('sends a message just to the timer owner', (t) => {
  const timerId = 'foo';
  const ownerWebsocket = { send: sinon.fake() };
  const otherWebsocket = { send: sinon.fake() };
  const initialState = {
    connections: [
      Connection.make(ownerWebsocket, timerId, true),
      Connection.make(otherWebsocket, timerId, false),
    ],
  };

  const message = 'test';

  const [state, effect] = update(
    Action.MessageTimerOwner({}, timerId, message),
    initialState,
  );

  t.is(state, initialState);
  t.is(effect.type, effects.thunk(() => {}).type);

  effect.method();

  t.truthy(ownerWebsocket.send.calledOnceWithExactly(message));
  t.falsy(otherWebsocket.send.calledOnceWithExactly(message));
});

test('does not send a message just to the timer owner if the originator is the owner', (t) => {
  const timerId = 'foo';
  const ownerWebsocket = { send: sinon.fake() };
  const otherWebsocket = { send: sinon.fake() };

  const initialState = {
    connections: [
      Connection.make(ownerWebsocket, timerId, true),
      Connection.make(otherWebsocket, timerId, false),
    ],
  };

  const message = 'test';

  const [state, effect] = update(
    Action.MessageTimerOwner(ownerWebsocket, timerId, message),
    initialState,
  );

  t.is(state, initialState);
  t.is(effect.type, effects.thunk(() => {}).type);

  effect.method();

  t.falsy(ownerWebsocket.send.calledOnceWithExactly(message));
  t.falsy(otherWebsocket.send.calledOnceWithExactly(message));
});
