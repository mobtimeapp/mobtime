import test from 'ava';
import sinon from 'sinon';
import { app, effects, tester } from 'ferp';
import * as Actions from './actions.js';
import { Queue } from './queue.js';
import { fakeSocket } from './support/fakeSocket.js';

test('Adding two connections together does not duplicate id', async t => {
  const queue = Queue.forTesting();

  const testerInstance = await tester({
    connections: {},
    nextId: 'abc123',
    queue,
  })
    .willBatch()
    .willAct('AddConnection')
    .willAct('AddConnection')
    .fromEffect(
      effects.batch([
        effects.act(Actions.AddConnection(fakeSocket(), 'foo')),
        effects.act(Actions.AddConnection(fakeSocket(), 'bar')),
      ]),
    );

  t.not(
    testerInstance.state().connections.foo[0].id,
    testerInstance.state().connections.bar[0].id,
  );
});
