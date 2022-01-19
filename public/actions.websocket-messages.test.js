import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can update settings from websocket message', t => {
  const settings = { foo: 'bar' };
  const state = actions.UpdateByWebsocketData(
    {},
    {
      payload: {
        type: 'settings:update',
        settings,
      },
      documentElement: {},
      Notification: {},
    },
  );

  t.deepEqual(state, {
    settings,
  });
});

test('can update timer from websocket message', t => {
  const data = {
    timerStartedAt: Date.now(),
    timerDuration: 999,
  };
  const state = actions.UpdateByWebsocketData(
    {},
    {
      payload: {
        type: 'timer:update',
        ...data,
      },
      documentElement: {},
      Notification: {},
    },
  );

  t.deepEqual(state, {
    ...data,
  });
});

test('can start timer from websocket message', t => {
  const timerDuration = 1000;

  const initialState = {
    timerDuration: null,
  };

  const now = Date.now();
  const state = actions.UpdateByWebsocketData(initialState, {
    payload: {
      type: 'timer:start',
      timerDuration,
    },
    documentElement: {},
    Notification: {},
  });

  t.like(state, {
    timerDuration,
  });
  const isNearNow = Math.abs(now - state.timerStartedAt) < 50;
  t.truthy(isNearNow, 'timerStartedAt within 50ms of now');
});

test('can pause timer from websocket message', t => {
  const timerDuration = 1000;

  const initialState = {
    timerStartedAt: Date.now(),
    timerDuration: 5000,
  };

  const state = actions.UpdateByWebsocketData(initialState, {
    payload: {
      type: 'timer:pause',
      timerDuration,
    },
    documentElement: {},
    Notification: {},
  });

  t.deepEqual(state, {
    timerStartedAt: null,
    timerDuration,
  });
});

test('can complete timer from websocket message', t => {
  const initialState = {
    timerStartedAt: Date.now(),
    timerDuration: 5000,
  };

  const documentElement = {};
  const Notification = {};

  const [state, effect] = actions.UpdateByWebsocketData(initialState, {
    payload: {
      type: 'timer:complete',
    },
    documentElement,
    Notification,
  });

  t.deepEqual(state, initialState);
  t.deepEqual(
    effect,
    effects.andThen({
      action: actions.EndTurn,
      props: {},
    }),
  );
});

test('can skip complete timer from websocket message if timer already over', t => {
  const initialState = {
    timerStartedAt: null,
    timerDuration: 0,
  };

  const documentElement = {};
  const Notification = {};

  const state = actions.UpdateByWebsocketData(initialState, {
    payload: {
      type: 'timer:complete',
    },
    documentElement,
    Notification,
  });

  t.is(state, initialState);
});

test('can update goals from websocket message', t => {
  const goals = ['foo'];
  const state = actions.UpdateByWebsocketData(
    {},
    {
      payload: {
        type: 'goals:update',
        goals,
      },
      documentElement: {},
      Notification: {},
    },
  );

  t.deepEqual(state, {
    goals,
  });
});

test('can update mob from websocket message', t => {
  const mob = ['foo'];
  const state = actions.UpdateByWebsocketData(
    {},
    {
      payload: {
        type: 'mob:update',
        mob,
      },
      documentElement: {},
      Notification: {},
    },
  );

  t.deepEqual(state, {
    mob,
  });
});

test('does nothing from unknown type from websocket message', t => {
  const initialState = {};
  const state = actions.UpdateByWebsocketData(initialState, {
    payload: {
      type: 'foobarbaz',
    },
    documentElement: {},
    Notification: {},
  });

  t.is(state, initialState);
});
