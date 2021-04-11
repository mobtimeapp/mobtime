import test from 'ava';
import { effects } from 'ferp';
import { id } from './id';

import { update } from './update';
import Action from './actions';

import * as Connection from './connection';

test('updates goals statistics from message', (t) => {
  const timerId = 'foo';
  const initialState = {
    statistics: {
      [timerId]: {
        connections: 0,
        mobbers: 0,
        goals: 0,
      },
    },
  };

  const message = {
    type: 'goals:update',
    goals: Array.from({ length: Math.ceil(Math.random() * 100) }, () => ({})),
  };

  const [state, effect] = update(
    Action.UpdateStatisticsFromMessage(timerId, JSON.stringify(message)),
    initialState,
  );

  t.deepEqual(state.statistics[timerId], {
    connections: 0,
    goals: message.goals.length,
    mobbers: 0,
  });

  t.deepEqual(effect, effects.none());
});

test('updates mobbers statistics from message', (t) => {
  const timerId = 'foo';
  const initialState = {
    statistics: {
      [timerId]: {
        connections: 0,
        mobbers: 0,
        goals: 0,
      },
    },
  };

  const message = {
    type: 'mob:update',
    mob: Array.from({ length: Math.ceil(Math.random() * 100) }, () => ({})),
  };

  const [state, effect] = update(
    Action.UpdateStatisticsFromMessage(timerId, JSON.stringify(message)),
    initialState,
  );

  t.deepEqual(state.statistics[timerId], {
    connections: 0,
    mobbers: message.mob.length,
    goals: 0,
  });

  t.deepEqual(effect, effects.none());
});

test('updates no statistics from unknown message', (t) => {
  const timerId = 'foo';
  const initialState = {
    statistics: {
      [timerId]: {
        connections: 0,
        mobbers: 0,
        goals: 0,
      },
    },
  };

  const message = {
    type: 'unknown:message',
    foo: 'bar',
  };

  const [state, effect] = update(
    Action.UpdateStatisticsFromMessage(timerId, JSON.stringify(message)),
    initialState,
  );

  t.deepEqual(state.statistics[timerId], {
    connections: 0,
    mobbers: 0,
    goals: 0,
  });

  t.deepEqual(effect, effects.none());
});

test('updates connection count with latest number', (t) => {
  const timerId = 'foo';
  const initialState = {
    statistics: {
      [timerId]: {
        connections: 0,
        mobbers: 0,
        goals: 0,
      },
    },
    connections: [
      Connection.make({}, timerId),
    ],
  };

  const [state, effect] = update(
    Action.UpdateStatisticsFromConnections(timerId),
    initialState,
  );

  t.deepEqual(state.statistics, {
    [timerId]: {
      connections: 1,
      mobbers: 0,
      goals: 0,
    },
  });

  t.deepEqual(effect, effects.none());
});

test('removes timer statistics when there are no connections', (t) => {
  const timerId = 'foo';
  const initialState = {
    statistics: {
      [timerId]: {
        connections: 1,
        mobbers: 0,
        goals: 0,
      },
    },
    connections: [],
  };

  const [state, effect] = update(
    Action.UpdateStatisticsFromConnections(timerId),
    initialState,
  );

  t.deepEqual(state.statistics, {});
  t.deepEqual(effect, effects.none());
});
