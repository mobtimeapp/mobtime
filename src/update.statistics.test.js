import test from 'ava';
import { effects } from 'ferp';
import { id } from './id';

import { update } from './update';
import Action from './actions';

const makeState = (actions) => {
  const [state] = actions.reduce(([state], action) => (
    update(action, state)
  ), update(Action.Init(), {}));
  return state;
};

const makeMobber = () => ({
  id: id(),
  name: id(),
});

const makeGoal = () => ({
  id: id(),
  text: id(),
  completed: false,
});

test('intercepts goals:update to update goal count of timer', (t) => {
  const timerId = 'foo';
  const initialState = makeState([
    Action.AddConnection({}, timerId),
  ]);

  const message = {
    type: 'goals:update',
    goals: Array.from({ length: Math.ceil(Math.random() * 100) }, () => (
      makeGoal()
    )),
  };

  const [state] = update(
    Action.MessageTimer({}, timerId, JSON.stringify(message)),
    initialState,
  );

  t.deepEqual(state.statistics[timerId], {
    connections: 1,
    goals: message.goals.length,
    mobbers: 0,
  });
});

test('intercepts mob:update to update mobber count of timer', (t) => {
  const timerId = 'foo';
  const initialState = makeState([
    Action.AddConnection({}, timerId),
  ]);

  const message = {
    type: 'mob:update',
    mob: Array.from({ length: Math.ceil(Math.random() * 100) }, () => (
      makeMobber()
    )),
  };

  const [state] = update(
    Action.MessageTimer({}, timerId, JSON.stringify(message)),
    initialState,
  );

  t.deepEqual(state.statistics[timerId], {
    connections: 1,
    goals: 0,
    mobbers: message.mob.length,
  });
});
