import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

const makeGoal = (text) => ({
  id: Math.random().toString(36).slice(2),
  text,
  completed: true,
});

test('can add goal', (t) => {
  const websocket = {};
  const goalTextToAdd = 'foo';
  const initialState = {
    goals: [],
    goal: goalTextToAdd,
    websocket,
  };

  const [state, effect] = actions.AddGoal(initialState);

  t.like(state.goals[0], {
    text: goalTextToAdd, completed: false,
  });
  t.is(state.goal, '');
  t.deepEqual(effect, effects.UpdateGoals({
    websocket,
    goals: state.goals,
  }));
});
