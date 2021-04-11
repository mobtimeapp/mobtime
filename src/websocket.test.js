import test from 'ava';
import sinon from 'sinon';
import { app, effects } from 'ferp';
import {
  SendOwnership,
  CloseWebsocket,
  RelayMessage,
  Websocket,
} from './websocket.js';

const runEffect = effect =>
  app({
    init: [null, effect],
  });

const runSubscription = (init, observe, subscription) => {
  const QuitApp = state => [null, effects.none()];

  const dispatch = app({
    init,
    subscribe: state => [state && subscription],
    observe,
  });

  return () => dispatch(QuitApp);
};

const fakeWebsocket = () => {
  const events = {};
  const getEvents = name => events[name] || [];

  const on = (name, cb) => {
    events[name] = getEvents(name).concat(cb);
  };
  const trigger = (name, event) => getEvents(name).forEach(cb => cb(event));

  return {
    send: sinon.fake(),
    close: sinon.fake(),
    on,
    trigger,
  };
};

test('SendOwnership calls websocket send with expected data', t => {
  const isOwner = true;
  const connection = {
    websocket: fakeWebsocket(),
  };

  runEffect(SendOwnership(connection, isOwner));

  t.truthy(
    connection.websocket.send.calledOnceWithExactly(
      JSON.stringify({
        type: 'timer:ownership',
        isOwner,
      }),
    ),
    'calls websocket send',
  );
});

test('CloseWebsocket will close the websocket', t => {
  const websocket = fakeWebsocket();

  runEffect(CloseWebsocket(websocket));

  t.truthy(websocket.close.calledOnceWithExactly(), 'calls websocket.close');
});

test('RelayMessage sends the message to the connection', t => {
  const connection = {
    websocket: fakeWebsocket(),
  };
  const message = 'hello';

  runEffect(RelayMessage(connection, message));

  t.truthy(
    connection.websocket.send.calledOnceWithExactly(message),
    'calls websocket.close',
  );
});

test('WebsocketSub works', t => {
  const timerId = 'foo';
  const connection = { timerId, websocket: fakeWebsocket() };
  const state = { lastParams: null };
  const actions = {
    RemoveConnection: (websocket, tId) => () => [
      { lastParams: [websocket, tId] },
      effects.none(),
    ],
    MessageTimerOwner: (websocket, tId, data) => () => [
      { lastParams: [websocket, tId, data] },
      effects.none(),
    ],
    MessageTimer: (websocket, tId, data) => () => [
      { lastParams: [websocket, tId, data] },
      effects.none(),
    ],
  };

  const expectedStatesAndActionNames = [
    { state, actionName: 'ferpAppInitialize' },
    {
      state: { lastParams: [connection.websocket, timerId, '{}'] },
      actionName: 'MessageTimer',
    },
    {
      state: {
        lastParams: [connection.websocket, timerId, '{"type":"client:new"}'],
      },
      actionName: 'MessageTimerOwner',
    },
    {
      state: { lastParams: [connection.websocket, timerId] },
      actionName: 'RemoveConnection',
    },

    { state: null, actionName: undefined },
  ];

  const kill = runSubscription(
    [state, effects.none()],
    (tuple, actionName) => {
      if (expectedStatesAndActionNames.length === 0) {
        t.fail(
          `Not all messages accounted for:\n${JSON.stringify({
            tuple,
            actionName,
          })}`,
        );
      }
      const {
        state: expectedState,
        actionName: expectedActionName,
      } = expectedStatesAndActionNames.shift();
      t.is(actionName, expectedActionName);
      t.deepEqual(tuple[0], expectedState);
    },
    Websocket(actions, connection, timerId),
  );

  connection.websocket.trigger('message', '{}');
  connection.websocket.trigger('message', '{"type":"client:new"}');
  connection.websocket.trigger('close');
  connection.websocket.trigger('close');

  kill();
  t.pass();
});
