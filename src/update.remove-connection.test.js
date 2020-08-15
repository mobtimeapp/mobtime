import test from 'ava';
import { effects } from 'ferp';
import sinon from 'sinon';

import { update } from './update';
import Action from './actions';

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

test('cannot remove if timerId does not match', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const oldConnection = { websocket, timerId, isOwner: true };
  const [state, _effect] = update(
    Action.RemoveConnection(websocket, `blah-${timerId}`),
    { connections: [oldConnection] },
  );

  t.deepEqual(state, { connections: [oldConnection] });
});

test('sets owner to the next oldest connection', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const ownerConnection = { websocket, timerId, isOwner: true };
  const otherConnections = [
    { websocket: {}, timerId, isOwner: false },
    { websocket: {}, timerId, isOwner: false },
  ];
  const [state, _effect] = update(
    Action.RemoveConnection(websocket, timerId),
    { connections: [ownerConnection, ...otherConnections] },
  );

  t.deepEqual(state, {
    connections: [
      { ...otherConnections[0], isOwner: true },
      ...otherConnections.slice(1),
    ],
  });
});
