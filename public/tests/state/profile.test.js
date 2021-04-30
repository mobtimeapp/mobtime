import test from 'ava';

import * as State from '../../state.js';

test('manage the profile state', t => {
  let state = State.initial('foo', {});
  t.is(State.getProfile(state), null);

  const expectedProfile = {
    id: '123',
    name: 'Test',
    avatar: 'http://placehold.it/1x1',
  };
  state = State.setProfile(state, expectedProfile);
  t.deepEqual(State.getProfile(state), expectedProfile);

  const merged = { foo: 'bar' };
  state = State.mergeProfile(state, merged);
  t.deepEqual(State.getProfile(state), { ...expectedProfile, ...merged });
});

test('manage the toasts state', t => {
  let state = State.initial('foo', {});
  t.deepEqual(State.getToasts(state), []);

  state = State.appendToasts(state, { id: 1 });
  state = State.appendToasts(state, { id: 2 });
  t.deepEqual(State.getToasts(state), [{ id: 1 }, { id: 2 }]);

  state = State.dismissToastMessage(state);
  t.deepEqual(State.getToasts(state), [{ id: 2 }]);
});
