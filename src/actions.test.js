import test from 'ava';
import { effects } from 'ferp';
import * as Actions from './actions.js';
import { CloseWebsocket, RelayMessage } from './websocket';
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
  const queue = {};
  const [state, effect] = Actions.Init(queue, nextId);

  t.deepEqual(state, {
    connections: [],
    statistics: {},
    queue,
    nextId,
  });

  t.deepEqual(fx(effect), fx(effects.none()));
});

test('AddConnection adds the connection', t => {
  const timerId = 'foo';
  const websocket = {};
  const nextId = 'testId';
  const originalState = { connections: [], nextId };

  const [state, _effect] = Actions.AddConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [{ id: nextId, timerId, websocket }],
    nextId,
  });
});

test('RemoveConnection removes the connection', t => {
  const timerId = 'foo';
  const websocket = {};
  const connection = { id: 'test', timerId, websocket };
  const originalState = { connections: [connection] };

  const [state, _effect] = Actions.RemoveConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [],
  });
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
