import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

const makeMobber = name => ({
  id: Math.random()
    .toString(36)
    .slice(2),
  name,
});

test('can shuffle a mob', t => {
  const websocket = {};

  const initialState = {
    mob: [makeMobber('One'), makeMobber('Two')],
    websocket,
  };

  const [state, effect] = actions.ShuffleMob(initialState);

  t.is(state.mob.length, initialState.mob.length);
  t.not(state.mob, initialState.mob);

  t.deepEqual(
    effect,
    effects.UpdateMob({
      websocket,
      mob: state.mob,
    }),
  );
});

test('can cycle a mob', t => {
  const websocket = {};

  const initialState = {
    mob: [makeMobber('One'), makeMobber('Two'), makeMobber('Three')],
    websocket,
  };

  const [state, effect] = actions.CycleMob(initialState);

  t.deepEqual(state.mob, [
    initialState.mob[1],
    initialState.mob[2],
    initialState.mob[0],
  ]);

  t.deepEqual(effect, [
    effects.UpdateMob({
      websocket,
      mob: state.mob,
    }),
  ]);
});

test('cannot cycle an empty mob', t => {
  const websocket = {};

  const initialState = {
    mob: [],
    websocket,
  };

  const state = actions.CycleMob(initialState);

  t.is(state, initialState);
});

test('can cycle a mob while a timer is running', t => {
  const websocket = {};

  const initialState = {
    timerStartedAt: 1,
    mob: [makeMobber('One'), makeMobber('Two'), makeMobber('Three')],
    websocket,
  };

  const [state, effect] = actions.CycleMob(initialState);

  t.deepEqual(state.mob, [
    initialState.mob[1],
    initialState.mob[2],
    initialState.mob[0],
  ]);

  t.deepEqual(effect, [
    effects.UpdateMob({
      websocket,
      mob: state.mob,
    }),
    effects.andThen({
      action: actions.Completed,
      props: { isEndOfTurn: true },
    }),
  ]);
});

test('can add in-memory name to mob', t => {
  const websocket = {};
  const nameToAdd = 'Bar';

  const initialState = {
    mob: [makeMobber('One')],
    name: nameToAdd,
    websocket,
  };

  const [state, effect] = actions.AddNameToMob(initialState);

  t.is(state.mob.length, initialState.mob.length + 1);
  t.like(state.mob[1], { name: nameToAdd });

  t.deepEqual(
    effect,
    effects.UpdateMob({
      websocket,
      mob: state.mob,
    }),
  );
});

test('can remove name to mob', t => {
  const websocket = {};

  const initialState = {
    mob: [makeMobber('One')],
    websocket,
  };

  const [state, effect] = actions.RemoveFromMob(
    initialState,
    initialState.mob[0].id,
  );

  t.deepEqual(state, { mob: [], websocket });
  t.deepEqual(
    effect,
    effects.UpdateMob({
      websocket,
      mob: state.mob,
    }),
  );
});
