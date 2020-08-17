import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can update settings from websocket message', (t) => {
  const settings = { foo: 'bar' };
  const state = actions.UpdateByWebsocketData({}, {
    type: 'settings:update',
    settings,
  });

  t.deepEqual(state, {
    settings,
  });
});

test('can update timer from websocket message', (t) => {
  const data = {
    timerStartedAt: Date.now(),
    timerDuration: 999,
  };
  const state = actions.UpdateByWebsocketData({}, {
    type: 'timer:update',
    ...data,
  });

  t.deepEqual(state, {
    ...data,
  });
});

test('can update app state from websocket message', (t) => {
  const data = {
    timerStartedAt: 100,
    timerDuration: 10,
    mob: [],
    goals: [],
    settings: {},
    remainingTime: 5,
  };
  const state = actions.UpdateByWebsocketData({}, {
    type: 'timer:share',
    ...data,
  });

  t.deepEqual(state, {
    ...data,
  });
});

test('can update goals from websocket message', (t) => {
  const goals = ['foo'];
  const state = actions.UpdateByWebsocketData({}, {
    type: 'goals:update',
    goals,
  });

  t.deepEqual(state, {
    goals,
  });
});

test('can update mob from websocket message', (t) => {
  const mob = ['foo'];
  const state = actions.UpdateByWebsocketData({}, {
    type: 'mob:update',
    mob,
  });

  t.deepEqual(state, {
    mob,
  });
});

test('can share timer state when recieving client:new from websocket message', (t) => {
  const initialState = {
    timerStartedAt: 100,
    timerDuration: 10,
    mob: [],
    goals: [],
    settings: {},
    remainingTime: 5,
  };
  const [state, effect] = actions.UpdateByWebsocketData(initialState, {
    type: 'client:new',
  });

  t.is(state, initialState);
  t.deepEqual(effect, effects.ShareTimer(initialState));
});

test('can update ownership from websocket message', (t) => {
  const isOwner = false;
  const state = actions.UpdateByWebsocketData({}, {
    type: 'timer:ownership',
    isOwner,
  });

  t.deepEqual(state, {
    isOwner,
  });
});

test('does nothing from unknown type from websocket message', (t) => {
  const initialState = {};
  const state = actions.UpdateByWebsocketData(initialState, {
    type: 'foobarbaz',
  });

  t.is(state, initialState);
});
