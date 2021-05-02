import test from 'ava';

import * as State from '../../state.js';

test('manage shared state', t => {
  let state = State.initial('foo', {});
  t.deepEqual(State.getShared(state), {
    mob: [],
    goals: [],
    positions: 'Navigator,Driver',
    duration: 300999,
  });

  t.deepEqual(State.getMob(state), []);
  state = State.addToMob(state, 'A');
  state = State.addToMob(state, 'B', 'http://placehold.it/1x1', 'sdkfskjd');
  t.deepEqual(State.getMob(state), [
    { name: 'A', avatar: null, id: 'anonymous_a' },
    { name: 'B', avatar: 'http://placehold.it/1x1', id: 'sdkfskjd' },
  ]);
  state = State.cycleMob(state);
  t.deepEqual(State.getMob(state), [
    { name: 'B', avatar: 'http://placehold.it/1x1', id: 'sdkfskjd' },
    { name: 'A', avatar: null, id: 'anonymous_a' },
  ]);
  const shuffled = State.shuffleMob(state);
  t.notDeepEqual(State.getMob(shuffled), State.getMob(state));
  state = State.setMob(state, []);
  state = State.addToMob(state, 'A');
  state = State.addToMob(state, 'B');
  state = State.removeFromMob(state, 'anonymous_a');
  t.deepEqual(State.getMob(state), [
    { name: 'B', avatar: null, id: 'anonymous_b' },
  ]);
  state = State.removeFromMob(state, 'unused-id');
  t.deepEqual(State.getMob(state), [
    { name: 'B', avatar: null, id: 'anonymous_b' },
  ]);
  state = State.updateInMob(state, { id: 'anonymous_b', avatar: 'test.foo' });
  t.deepEqual(State.getMob(state), [
    { name: 'B', avatar: 'test.foo', id: 'anonymous_b' },
  ]);
});

test('goals do not duplicate when moving', t => {
  const goalTexts = ['First', 'Second', 'Third', 'Fourth'];
  let state = goalTexts.reduce((nextState, text, index) => {
    return State.addToGoals(nextState, { text, id: index + 1 });
  }, State.initial('foo', {}));

  state = State.moveGoalUp(state, { id: 3 });
  t.deepEqual(State.getGoals(state), [
    { id: 1, text: 'First', completed: false, parentId: null },
    { id: 3, text: 'Third', completed: false, parentId: null },
    { id: 2, text: 'Second', completed: false, parentId: null },
    { id: 4, text: 'Fourth', completed: false, parentId: null },
  ]);

  state = State.updateGoal(state, 3, 'Third', 1);
  t.deepEqual(State.getGoals(state), [
    { id: 1, text: 'First', completed: false, parentId: null },
    { id: 3, text: 'Third', completed: false, parentId: 1 },
    { id: 2, text: 'Second', completed: false, parentId: null },
    { id: 4, text: 'Fourth', completed: false, parentId: null },
  ]);

  state = State.moveGoalUp(state, { id: 4 });
  t.deepEqual(State.getGoals(state), [
    { id: 1, text: 'First', completed: false, parentId: null },
    { id: 3, text: 'Third', completed: false, parentId: 1 },
    { id: 4, text: 'Fourth', completed: false, parentId: null },
    { id: 2, text: 'Second', completed: false, parentId: null },
  ]);

  state = State.updateGoal(state, 4, 'Fourth', 1);
  t.deepEqual(State.getGoals(state), [
    { id: 1, text: 'First', completed: false, parentId: null },
    { id: 3, text: 'Third', completed: false, parentId: 1 },
    { id: 4, text: 'Fourth', completed: false, parentId: 1 },
    { id: 2, text: 'Second', completed: false, parentId: null },
  ]);
});
