import test from 'ava';

import * as actions from './actions';

test('does not start the break timer if breaks are disabled', t => {
  const websocket = {};

  const initialState = {
    settings: {
      breaksEnabled: false,
    },
    websocket,
  };

  const [state] = actions.StartBreakTimer(initialState);

  t.deepEqual(state, initialState);
});
