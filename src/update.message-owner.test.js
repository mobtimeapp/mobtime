import test from 'ava';
import { effects } from 'ferp';
import { id } from './id';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

const makeState = (actions) => {
  const [state] = actions.reduce(([state], action) => (
    update(action, state)
  ), update(Action.Init(), {}));
  return state;
};

test('sends a message just to the timer owner', (t) => {
  const timerId = 'foo';
  const ownerWebsocket = { send: sinon.fake() };
  const otherWebsocket = { send: sinon.fake() };
  const initialState = makeState([
    Action.AddConnection(ownerWebsocket, timerId),
    Action.AddConnection(otherWebsocket, timerId),
  ]);

  const message = 'test';

  const [state, fx] = update(
    Action.MessageTimerOwner({}, timerId, message),
    initialState,
  );

  t.is(state, initialState);
  t.is(fx.type, effects.thunk(() => {}).type);

  fx.method();

  t.truthy(ownerWebsocket.send.calledOnceWithExactly(message));
  t.falsy(otherWebsocket.send.calledOnceWithExactly(message));
});

test('does not send a message just to the timer owner if the originator is the owner', (t) => {
  const timerId = 'foo';
  const ownerWebsocket = { send: sinon.fake() };
  const otherWebsocket = { send: sinon.fake() };
  const initialState = makeState([
    Action.AddConnection(ownerWebsocket, timerId),
    Action.AddConnection(otherWebsocket, timerId),
  ]);

  const message = 'test';

  const [state, fx] = update(
    Action.MessageTimerOwner(ownerWebsocket, timerId, message),
    initialState,
  );

  t.is(state, initialState);
  t.is(fx.type, effects.thunk(() => {}).type);

  fx.method();

  t.falsy(ownerWebsocket.send.calledOnceWithExactly(message));
  t.falsy(otherWebsocket.send.calledOnceWithExactly(message));
});
