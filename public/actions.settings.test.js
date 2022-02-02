import test from 'ava';

import * as actions from './actions';
import * as effects from './effects';

test('can update settings from pending settings', t => {
  const websocket = {};
  const initialState = {
    externals: { socketEmitter: {} },
    settings: {},
    pendingSettings: { foo: 'bar' },
  };

  const [state, effect] = actions.UpdateSettings(initialState);

  t.deepEqual(state, {
    externals: { socketEmitter: {} },
    settings: { foo: 'bar' },
    pendingSettings: {},
  });

  t.deepEqual(
    effect,
    effects.UpdateSettings({
      socketEmitter: initialState.externals.socketEmitter,
      settings: state.settings,
    }),
  );
});
