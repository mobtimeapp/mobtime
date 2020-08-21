import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

import { calculateTimeRemaining } from './lib/calculateTimeRemaining';

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

test('can start timer from websocket message', (t) => {
  const timerDuration = 1000;

  const initialState = {
    timerDuration: null,
  };

  const now = Date.now();
  const state = actions.UpdateByWebsocketData(initialState, {
    type: 'timer:start',
    timerDuration,
  });

  t.like(state, {
    timerDuration,
  });
  const isNearNow = Math.abs(now - state.timerStartedAt) < 50;
  t.truthy(isNearNow, 'timerStartedAt within 50ms of now');
});

test('can pause timer from websocket message', (t) => {
  const timerDuration = 1000;

  const initialState = {
    timerStartedAt: Date.now(),
    timerDuration: 5000,
  };

  const state = actions.UpdateByWebsocketData(initialState, {
    type: 'timer:pause',
    timerDuration,
  });

  t.deepEqual(state, {
    timerStartedAt: null,
    timerDuration,
  });
});

test('can complete timer from websocket message', (t) => {
  const initialState = {
    timerStartedAt: Date.now(),
    timerDuration: 5000,
  };

  const [state, effect] = actions.UpdateByWebsocketData(initialState, {
    type: 'timer:complete',
  });

  t.deepEqual(state, {
    ...initialState,
    timerStartedAt: null,
  });
  t.deepEqual(effect, effects.andThen({
    action: actions.EndTurn,
    props: {},
  }));
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
  const websocket = {};
  const initialState = {
    timerStartedAt: 100,
    timerDuration: 10,
    mob: [],
    goals: [],
    settings: {},
    remainingTime: 5,
    websocket,
  };
  const [state, effect] = actions.UpdateByWebsocketData(initialState, {
    type: 'client:new',
  });

  t.is(state, initialState);
  t.deepEqual(effect, [
    effects.StartTimer({ websocket, timerDuration: calculateTimeRemaining(state) }),
    effects.UpdateMob({ websocket, mob: state.mob }),
    effects.UpdateGoals({ websocket, goals: state.goals }),
    effects.UpdateSettings({ websocket, settings: state.settings }),
  ]);
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
