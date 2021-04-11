import test from 'ava';
import { effects } from 'ferp';
import * as Actions from './actions.js';
import { SendOwnership, CloseWebsocket, RelayMessage } from './websocket';
import { GenerateIdEffect } from './id.js';

const fx = object => {
  try {
    return Object.keys(object).reduce((memo, key) => {
      if (typeof key === 'symbol') return memo;
      return { ...memo, [key]: fx(object[key]) };
    });
  } catch (err) {
    return object;
  }
};

test('Init resets connections and statistics, with no effect', t => {
  const nextId = 'foo';
  const [state, effect] = Actions.Init(nextId);

  t.deepEqual(state, {
    connections: [],
    statistics: {},
    nextId,
  });

  t.deepEqual(fx(effect), fx(effects.none()));
});

test('SetTimerOwner does nothing when there are no connections to a specified timerId', t => {
  const timerId = 'foo';
  const originalState = { connections: [] };

  const [state, effect] = Actions.SetTimerOwner(timerId)(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);
  t.deepEqual(effect, effects.none());
});

test('SetTimerOwner sets the first available connection to a timer as the owner', t => {
  const timerId = 'foo';
  const otherConnection = { timerId: 'bar', isOwner: false };
  const connection = { timerId, isOwner: false };
  const secondConnectionToTimer = { timerId, isOwner: false };
  const originalState = {
    connections: [otherConnection, connection, secondConnectionToTimer],
  };

  const [state, effect] = Actions.SetTimerOwner(timerId)(originalState);

  t.deepEqual(state, {
    connections: [
      { ...connection, isOwner: true },
      secondConnectionToTimer,
      otherConnection,
    ],
  });

  t.deepEqual(
    fx(effect),
    fx(
      effects.batch([
        SendOwnership({ ...connection, isOwner: true }, true),
        SendOwnership(secondConnectionToTimer, false),
      ]),
    ),
  );
});

test('AddConnection adds the connection and updates timer ownership along with statistics', t => {
  const timerId = 'foo';
  const websocket = {};
  const nextId = 'testId';
  const originalState = { connections: [], nextId };

  const [state, effect] = Actions.AddConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [{ id: nextId, timerId, websocket, isOwner: false }],
    nextId,
  });

  t.deepEqual(
    fx(effect),
    fx(
      effects.batch([
        GenerateIdEffect(Actions.SetNextId),
        effects.act(Actions.SetTimerOwner, timerId),
        effects.act(Actions.UpdateStatisticsFromConnections, timerId),
      ]),
    ),
  );
});

test('RemoveConnection removes the connection and updates timer ownership along with statistics', t => {
  const timerId = 'foo';
  const websocket = {};
  const connection = { id: 'test', timerId, websocket, isOwner: false };
  const originalState = { connections: [connection] };

  const [state, effect] = Actions.RemoveConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [],
  });

  t.deepEqual(
    fx(effect),
    fx(
      effects.batch([
        CloseWebsocket(websocket),
        effects.act(Actions.SetTimerOwner, timerId),
        effects.act(Actions.UpdateStatisticsFromConnections, timerId),
      ]),
    ),
  );
});

test('MessageTimer relays a message from one connection to all other connections on the same timerId', t => {
  const timerId = 'foo';
  const websocket = {};
  const message = 'hello world';
  const otherConnection = { timerId: 'bar', websocket: {} };
  const connection = { timerId, websocket };
  const secondConnectionToTimer = { timerId, websocket: {} };
  const originalState = {
    connections: [otherConnection, connection, secondConnectionToTimer],
  };

  const [state, effect] = Actions.MessageTimer(
    websocket,
    timerId,
    message,
  )(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);

  t.deepEqual(
    fx(effect),
    fx(
      effects.batch([
        RelayMessage(secondConnectionToTimer, message),
        effects.act(Actions.UpdateStatisticsFromMessage, timerId, message),
      ]),
    ),
  );
});

test('MessageTimerOwner relays a message to the timer owner', t => {
  const timerId = 'foo';
  const websocket = {};
  const message = 'hello world';
  const otherConnection = { timerId: 'bar', websocket: {} };
  const connection = { timerId, websocket, isOwner: true };
  const secondConnectionToTimer = { timerId, websocket: {} };
  const originalState = {
    connections: [otherConnection, connection, secondConnectionToTimer],
  };

  const [state, effect] = Actions.MessageTimerOwner(
    secondConnectionToTimer.websocket,
    timerId,
    message,
  )(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);

  t.deepEqual(fx(effect), fx(RelayMessage(connection, message)));
});

test('MessageTimerOwner does not relay a message to the timer owner if the message originated from the timer owner websocket', t => {
  const timerId = 'foo';
  const websocket = {};
  const message = 'hello world';
  const otherConnection = { timerId: 'bar', websocket: {} };
  const connection = { timerId, websocket, isOwner: true };
  const secondConnectionToTimer = { timerId, websocket: {} };
  const originalState = {
    connections: [otherConnection, connection, secondConnectionToTimer],
  };

  const [state, effect] = Actions.MessageTimerOwner(
    websocket,
    timerId,
    message,
  )(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);

  t.deepEqual(fx(effect), fx(effects.none()));
});
