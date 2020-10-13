import test from 'ava';
import * as actions from './actions';

test('moves mob member from top to bottom', t => {
  const initialState = {
    mob: ['First', 'Second', 'Third', 'Fourth'],
  };
  const [state] = actions.MoveMob(initialState, {
    from: 0,
    to: 4,
  });

  t.deepEqual(state.mob, ['Second', 'Third', 'Fourth', 'First']);
});

test('moves mob member from bottom to top', t => {
  const initialState = {
    mob: ['First', 'Second', 'Third', 'Fourth'],
  };
  const [state] = actions.MoveMob(initialState, {
    from: 3,
    to: 0,
  });

  t.deepEqual(state.mob, ['Fourth', 'First', 'Second', 'Third']);
});

// ------

test('moves goals member from top to bottom', t => {
  const initialState = {
    goals: ['First', 'Second', 'Third', 'Fourth'],
  };
  const [state] = actions.MoveGoal(initialState, {
    from: 0,
    to: 4,
  });

  t.deepEqual(state.goals, ['Second', 'Third', 'Fourth', 'First']);
});

test('moves goals member from bottom to top', t => {
  const initialState = {
    goals: ['First', 'Second', 'Third', 'Fourth'],
  };
  const [state] = actions.MoveGoal(initialState, {
    from: 3,
    to: 0,
  });

  t.deepEqual(state.goals, ['Fourth', 'First', 'Second', 'Third']);
});
