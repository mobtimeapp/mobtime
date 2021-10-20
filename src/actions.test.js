import test from 'ava';
import * as sinon from 'sinon';
import { effects } from 'ferp';
import * as Actions from './actions.js';
import { CloseWebsocket, RelayMessage } from './websocket';
import { GenerateIdEffect } from './id.js';
import { WriteCacheTimerState, ShareCacheTimerState } from './redis.js';

test('Init resets connections and statistics, with no effect', t => {
  const nextId = 'foo';
  const [state, effect] = Actions.Init(nextId);

  t.deepEqual(state, {
    connections: [],
    statistics: {},
    nextId,
    redisConnection: null,
  });

  t.deepEqual(effect, effects.none());
});

test('AddConnection adds the connection and updates timer ownership along with statistics', t => {
  const timerId = 'foo';
  const websocket = {};
  const nextId = 'testId';
  const originalState = {
    connections: [],
    nextId,
    redisConnection: { get: () => Promise.resolve() },
  };

  const [state, effect] = Actions.AddConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [{ id: nextId, timerId, websocket }],
    nextId,
    redisConnection: originalState.redisConnection,
  });

  t.deepEqual(
    effect,
    effects.batch([
      GenerateIdEffect(Actions.SetNextId),
      effects.act(Actions.UpdateStatisticsFromConnections, timerId),
      ShareCacheTimerState(
        { id: nextId, timerId, websocket },
        originalState.redisConnection,
        timerId,
      ),
    ]),
  );
});

test('RemoveConnection removes the connection and updates timer ownership along with statistics', t => {
  const timerId = 'foo';
  const websocket = {};
  const connection = { id: 'test', timerId, websocket };
  const originalState = { connections: [connection] };

  const [state, effect] = Actions.RemoveConnection(
    websocket,
    timerId,
  )(originalState);

  t.deepEqual(state, {
    connections: [],
  });

  t.deepEqual(
    effect,
    effects.batch([
      CloseWebsocket(websocket),
      effects.act(Actions.UpdateStatisticsFromConnections, timerId),
    ]),
  );
});

test('MessageTimer relays a message to all connections', t => {
  const timerId = 'foo';
  const message = 'hello world';
  const originalState = {
    connections: [
      { timerId, websocket: {} },
      { timerId, websocket: {} },
    ],
    redisConnection: {
      get: sinon.fake(() => Promise.resolve()),
      publish: sinon.fake(() => Promise.resolve()),
    },
  };

  const [state, effect] = Actions.MessageTimer(timerId, message)(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);

  t.deepEqual(
    effect,
    effects.batch([
      RelayMessage(originalState.connections[0], message),
      RelayMessage(originalState.connections[1], message),
      effects.act(Actions.UpdateStatisticsFromMessage, timerId, message),
      WriteCacheTimerState(originalState.redisConnection, message, timerId),
    ]),
  );
});
