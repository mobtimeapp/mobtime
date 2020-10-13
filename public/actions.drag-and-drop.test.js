import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can start a drag', t => {
  const state = actions.DragSelect(
    {},
    {
      type: 'foo',
      from: 0,
      clientX: 100,
      clientY: 200,
    },
  );

  t.deepEqual(state.drag, {
    active: false,
    type: 'foo',
    from: 0,
    to: null,
    clientX: 100,
    clientY: 200,
  });
});

test('can move an inactive drag', t => {
  const initialState = actions.DragSelect(
    {},
    {
      type: 'foo',
      from: 0,
      active: false,
      clientX: 100,
      clientY: 200,
    },
  );

  const state = actions.DragMove(initialState, {
    clientX: 500,
    clientY: 600,
  });

  t.like(state.drag, {
    active: true,
    to: initialState.drag.from,
    clientX: 500,
    clientY: 600,
  });
});

test('can move an active drag', t => {
  const initialState = {
    drag: {
      type: 'foo',
      from: 0,
      active: true,
      clientX: 100,
      clientY: 200,
    },
  };

  const state = actions.DragMove(initialState, {
    clientX: 500,
    clientY: 600,
  });

  t.like(state.drag, {
    active: true,
    clientX: 500,
    clientY: 600,
  });
});

test('does not move the drag if the mouse has not moved at least 5 pixels', t => {
  const initialState = actions.DragSelect(
    {},
    {
      type: 'foo',
      from: 0,
      clientX: 100,
      clientY: 200,
    },
  );

  const state = actions.DragMove(initialState, {
    clientX: 101,
    clientY: 201,
  });

  t.like(state.drag, {
    active: false,
    from: 0,
    to: null,
    clientX: 100,
    clientY: 200,
  });
});

test('can move a drag to an index', t => {
  const initialState = {
    drag: {
      from: 2,
      to: null,
    },
  };

  const state = actions.DragTo(initialState, {
    to: 5,
  });

  t.like(state.drag, {
    from: 2,
    to: 5,
  });
});

test('can cancel a drag', t => {
  const initialState = { drag: {} };

  const state = actions.DragCancel(initialState);

  t.deepEqual(state.drag, {
    active: false,
    type: null,
    from: null,
    to: null,
    clientX: null,
    clientY: null,
  });
});

test('can end a good mob drag', t => {
  const initialState = {
    drag: {
      type: 'mob',
      active: true,
      to: 0,
      from: 1,
    },
  };

  const [state, effect] = actions.DragEnd(initialState);

  t.deepEqual(state.drag, {
    active: false,
    type: null,
    from: null,
    to: null,
    clientX: null,
    clientY: null,
  });

  t.deepEqual(
    effect,
    effects.andThen({
      action: actions.MoveMob,
      props: initialState.drag,
    }),
  );
});

test('can end a good goal drag', t => {
  const initialState = {
    drag: {
      type: 'goal',
      active: true,
      to: 0,
      from: 1,
    },
  };

  const [state, effect] = actions.DragEnd(initialState);

  t.deepEqual(state.drag, {
    active: false,
    type: null,
    from: null,
    to: null,
    clientX: null,
    clientY: null,
  });

  t.deepEqual(
    effect,
    effects.andThen({
      action: actions.MoveGoal,
      props: initialState.drag,
    }),
  );
});

test('can end a bad drag', t => {
  const initialState = {
    drag: {
      type: 'goal',
      active: false,
      to: 0,
      from: 1,
    },
  };

  const state = actions.DragEnd(initialState);

  t.deepEqual(state.drag, {
    active: false,
    type: null,
    from: null,
    to: null,
    clientX: null,
    clientY: null,
  });
});
