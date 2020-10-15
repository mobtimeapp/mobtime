import test from 'ava';
import * as actions from './actions';

test('removes single user in larger group, ref https://github.com/mrozbarry/mobtime/issues/142', t => {
  const addMobber = (state, name) => {
    const [nextState] = actions.AddNameToMob(actions.UpdateName(state, name));
    return nextState;
  };

  let state = actions.Init(null, 'foo');
  for (let mobber = 0; mobber < 12; mobber += 1) {
    state = addMobber(state, `Mobber-${mobber}`);
  }
  [state] = actions.Completed(state, {
    isEndOfTurn: true,
    documentElement: {},
    Notification: {},
  });

  const { id } = state.mob[1];
  [state] = actions.RemoveFromMob(state, id);

  t.is(state.mob.length, 11);
});
