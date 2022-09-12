import test from 'ava';
import { effects, tester } from 'ferp';
import * as Actions from './actions.js';
import { Queue } from './queue.js';
import { fakeSocket } from './support/fakeSocket.js';

const fx = object => {
  switch (object.type.toString()) {
    case 'Symbol(thunk)':
      return fx(object.method());

    case 'Symbol(batch)':
      return object.effects.map(fx);

    case 'Symbol(defer)':
      return 'defer';

    case 'Symbol(none)':
      return 'none';

    case 'Symbol(act)':
      return `act(${object.name})`;
  }
};

test('Init resets connections and statistics, with no effect', async t => {
  const nextId = 'foo';
  const queue = {};

  const { ok, state } = await tester().fromAction(() =>
    Actions.Init(queue, nextId),
  );

  t.truthy(ok());

  t.deepEqual(state(), {
    connections: {},
    queue,
    nextId,
  });
});

test('AddConnection adds the connection', async t => {
  const timerId = 'foo';
  const websocket = fakeSocket();
  const nextId = 'testId';
  const queue = Queue.forTesting();

  const { ok, state, failedOn } = await tester({
    connections: {},
    nextId,
    queue,
  })
    .willBatch()
    .willAct('')
    .willAct('UpdateConnectionStatistics')
    .willAct('ShareTimerWith')
    .fromAction(Actions.AddConnection(websocket, timerId));

  t.truthy(ok(), `Failed expecatations: ${failedOn().join(', ')}`);

  t.deepEqual(state(), {
    connections: {
      [timerId]: [{ id: nextId, timerId, websocket }],
    },
    nextId: state().nextId,
    queue,
  });
});

test('RemoveConnection removes the connection', async t => {
  const timerId = 'foo';
  const websocket = fakeSocket();
  const connection = { id: 'test', timerId, websocket };
  const queue = Queue.forTesting();

  const { ok, failedOn, state } = await tester({
    connections: { [timerId]: [connection] },
    queue,
  })
    .willAct('UpdateConnectionStatistics')
    .fromAction(Actions.RemoveConnection(connection.id, timerId));

  t.truthy(ok(), `Failed expecatations: ${failedOn().join(', ')}`);

  t.deepEqual(state(), {
    connections: {},
    queue,
  });
});

test('MessageTimer relays a message from one connection to all connections on the same timerId', async t => {
  const timerId = 'foo';
  const websocket = fakeSocket();
  const message = JSON.stringify({ type: 'foo' });
  const connection = { timerId, websocket };
  const secondConnectionToTimer = { timerId, websocket: fakeSocket() };
  const otherConnection = { timerId: 'bar', websocket: fakeSocket() };
  const queue = Queue.forTesting();
  const initialState = {
    connections: {
      bar: [otherConnection],
      foo: [connection, secondConnectionToTimer],
    },
    queue,
  };

  const { ok, state, failedOn, hit, missed } = await tester(initialState)
    .willDefer('ShareMessage')
    .fromAction(Actions.MessageTimer(timerId, message), 'MessageTimer');

  t.log('hit', hit());
  t.log('missed', missed());

  t.truthy(ok(), `Failed expectations: ${failedOn().join(', ')}`);

  t.deepEqual(state(), initialState);
});

test('ShareTimerWith sends settings, mob, and goals', async t => {
  const timerId = 'foo';
  const websocket = fakeSocket();
  const connection = { timerId, websocket };
  const timerState = {
    settings: { one: '1' },
    mob: [],
    goals: [],
  };
  const queue = Queue.forTesting({
    timer_foo: JSON.stringify(timerState),
  });
  const originalState = {
    connections: [connection],
    queue,
  };

  const [state, effect] = Actions.ShareTimerWith(
    websocket,
    timerId,
  )(originalState);

  t.is(state, originalState);
  t.deepEqual(state, originalState);

  t.deepEqual(fx(effect), fx(effects.defer()));
});
