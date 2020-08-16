import test from 'ava';
import { effects } from 'ferp';

import { update } from './update';
import Action from './actions';

const makeState = (actions) => {
  const [state, _effect] = actions.reduce(([state, _fx], action) => (
    update(action, state)
  ), update(Action.Init(), {}));
  return state;
};

test('can remove an old connection', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const [state, effect] = update(
    Action.RemoveConnection(websocket, timerId),
    makeState([
      Action.AddConnection(websocket, timerId),
    ]),
  );

  t.deepEqual(state, {
    connections: [],
    statistics: {},
  });
  t.deepEqual(effect, effects.none());
});

test('cannot remove if timerId does not match', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const oldConnection = { websocket, timerId, isOwner: true };
  const [state, _effect] = update(
    Action.RemoveConnection(websocket, `blah-${timerId}`),
    makeState([
      Action.AddConnection(oldConnection.websocket, oldConnection.timerId),
    ]),
  );

  t.deepEqual(state.connections, [oldConnection]);
});

test('sets owner to the next oldest connection', (t) => {
  const websocket = {};
  const timerId = 'foo';
  const ownerConnection = { websocket, timerId };
  const otherConnections = [
    { websocket: {}, timerId },
    { websocket: {}, timerId },
  ];

  const [state, _effect] = update(
    Action.RemoveConnection(websocket, timerId),
    makeState([
      Action.AddConnection(ownerConnection.websocket, ownerConnection.timerId),
      ...otherConnections.map((otherConnection) => Action.AddConnection(
        otherConnection.websocket,
        otherConnection.timerId,
      )),
    ]),
    { connections: [ownerConnection, ...otherConnections] },
  );

  t.deepEqual(state, {
    connections: [
      { ...otherConnections[0], isOwner: true },
      ...otherConnections.slice(1).map((oc) => ({ ...oc, isOwner: false })),
    ],
    statistics: {
      [timerId]: {
        connections: otherConnections.length,
        mobbers: 0,
        goals: 0,
      },
    },
  });
});
