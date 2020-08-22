import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

import * as Connection from './connection';

test('updates the first connection of a timer to be the owner', (t) => {
  const timerId = 'foo';
  const futureOwner = Connection.make({ send: sinon.fake() }, timerId);
  const notOwner = Connection.make({ send: sinon.fake() }, timerId);

  const initialState = {
    connections: [
      futureOwner,
      notOwner,
    ],
  };

  const [state, effect] = update(
    Action.SetTimerOwner(timerId),
    initialState,
  );

  t.deepEqual(state.connections[0], {
    ...futureOwner,
    isOwner: true,
  });
  t.is(effect.type, effects.batch([]).type);

  effect.effects.forEach((fx) => {
    t.is(fx.type, effects.thunk().type);
    fx.method();
  });

  const ownerMessage = JSON.stringify({
    type: 'timer:ownership',
    isOwner: true,
  });

  const notOwnerMessage = JSON.stringify({
    type: 'timer:ownership',
    isOwner: false,
  });

  t.truthy(
    futureOwner.getWebsocket().send.calledOnceWithExactly(ownerMessage),
  );
  t.truthy(
    notOwner.getWebsocket().send.calledOnceWithExactly(notOwnerMessage),
  );
});

test('does not update a timer owner if there are no connections to that timer', (t) => {
  const timerId = 'foo';
  const mainTimerId = `${timerId}-${Math.random().toString(36)}`;
  const futureOwner = Connection.make({ send: sinon.fake() }, timerId);
  const notOwner = Connection.make({ send: sinon.fake() }, timerId);

  const initialState = {
    connections: [
      futureOwner,
      notOwner,
    ],
  };

  const [state, effect] = update(
    Action.SetTimerOwner(mainTimerId),
    initialState,
  );

  t.is(state, initialState);
  t.deepEqual(effect, effects.none());
});
