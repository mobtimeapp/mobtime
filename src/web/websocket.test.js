import test from 'ava';
import { app, effects, tester } from 'ferp';
import { RelayMessage, ShareMessage, Websocket } from './websocket.js';
import { fakeSocket } from './support/fakeSocket.js';
import { Queue } from './queue.js';

test('RelayMessage sends the message to the connection', async t => {
  const connection = { websocket: fakeSocket() };
  const message = 'hello';

  await tester().fromEffect(RelayMessage(connection, message));

  t.truthy(
    connection.websocket.send.calledOnceWithExactly(message),
    'calls websocket.send',
  );
});

test('ShareMessage messages many people about a timer', async t => {
  const connections = [
    { websocket: fakeSocket() },
    { websocket: fakeSocket() },
    { websocket: fakeSocket() },
  ];
  const timerId = 'foo';
  const queue = Queue.forTesting({
    [`timer_${timerId}`]: JSON.stringify({ timerStartedAt: 11111 }),
  });

  const { ok } = await tester()
    .willDefer('ShareMessage')
    .willBatch('ShareMessageBatch')
    .willThunk('RelayMessage')
    .willThunk('RelayMessage')
    .willThunk('RelayMessage')
    .fromEffect(
      ShareMessage(
        timerId,
        connections,
        JSON.stringify({ type: 'foo' }),
        queue,
      ),
    );

  t.truthy(ok());
});

test('ShareMessage prevents timer complete cascade', async t => {
  const connections = [
    { websocket: fakeSocket() },
    { websocket: fakeSocket() },
    { websocket: fakeSocket() },
  ];
  const timerId = 'foo';
  const queue = Queue.forTesting({
    [`timer_${timerId}`]: JSON.stringify({
      timerStartedAt: null,
      timerDuration: 0,
    }),
  });

  const { ok } = await tester()
    .includeEffectNone()
    .willDefer('ShareMessage')
    .willNone('ShareMessageNone')
    .fromEffect(
      ShareMessage(
        timerId,
        connections,
        JSON.stringify({ type: 'timer:complete' }),
        queue,
      ),
    );

  t.truthy(ok());
});

test('WebsocketSub works', async t => {
  const timerId = 'foo';
  const connection = { timerId, websocket: fakeSocket() };
  const state = { lastParams: null };
  const actions = {
    RemoveConnection: (websocket, tId) => () => [
      { lastParams: [websocket, tId] },
      effects.none(),
    ],
    UpdateTimer: (tId, data) => () => [
      { lastParams: [tId, data] },
      effects.none(),
    ],
  };

  const { cancel, ok } = tester(state)
    .willAct('RemoveConnection')
    .willAct('UpdateTimer')
    .fromSubscription(Websocket(actions, connection, timerId));

  connection.websocket.trigger('message', '{}');
  connection.websocket.trigger('close');
  connection.websocket.trigger('close');

  cancel();

  t.truthy(ok());
});
