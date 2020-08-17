import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can open a prompt', (t) => {
  const context = {};
  const state = actions.PromptOpen({}, {
    text: 'Foo',
    defaultValue: '',
    OnValue: actions.Noop,
    context,
  });
  t.deepEqual(state.prompt, {
    text: 'Foo',
    defaultValue: '',
    OnValue: actions.Noop,
    context,
    visible: true,
  });
});

test('can ok a prompt', (t) => {
  const context = {};

  const action = () => {};

  const initialState = actions.PromptOpen({}, {
    text: 'Foo',
    defaultValue: '',
    OnValue: action,
    context,
  });

  const [state, effect] = actions.PromptOK(initialState, {
    value: 'test',
  });

  t.like(state.prompt, {
    visible: false,
  });

  t.is(effect[0], effects.andThen({})[0]);
  t.deepEqual(effect[1], {
    action,
    props: {
      value: 'test',
    },
  });
});

test('can cancel a prompt', (t) => {
  const context = {};

  const action = () => {};

  const initialState = actions.PromptOpen({}, {
    text: 'Foo',
    defaultValue: '',
    OnValue: action,
    context,
  });

  const state = actions.PromptCancel(initialState);

  t.like(state.prompt, {
    visible: false,
  });
});
