import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

const makeUser = name => ({
  id: Math.random()
    .toString(36)
    .slice(2),
  name,
});

test('can rename a user', t => {
  const websocket = {};
  const mobber = makeUser('Foo');
  const renameTo = 'Bar';

  const initialState = {
    mob: [mobber],
    websocket,
  };

  const mob = [{ id: mobber.id, name: renameTo }];

  const [state, effect] = actions.RenameUser(initialState, {
    id: mobber.id,
    value: renameTo,
  });

  t.deepEqual(state, {
    mob: [{ id: mobber.id, name: renameTo }],
    websocket,
  });
  t.deepEqual(
    effect,
    effects.UpdateMob({
      websocket,
      mob,
    }),
  );
});

test('can prompt to rename a user', t => {
  const mobber = makeUser('Foo');

  const initialState = {
    mob: [mobber],
  };

  const [state, effect] = actions.RenameUserPrompt(initialState, {
    id: mobber.id,
  });

  t.deepEqual(state, initialState);
  t.deepEqual(
    effect,
    effects.andThen({
      action: actions.PromptOpen,
      props: {
        text: 'Rename Mob Member',
        defaultValue: 'Foo',
        OnValue: actions.RenameUser,
        context: {
          id: mobber.id,
        },
      },
    }),
  );
});

test('can update in-memory name', t => {
  const initialState = { name: '' };

  const state = actions.UpdateName(initialState, 'foo');

  t.deepEqual(state, { name: 'foo' });
});
