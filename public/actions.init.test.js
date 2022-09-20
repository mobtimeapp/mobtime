import test from 'ava';
import * as actions from './actions.js';
import * as i18n from './i18n/index.js';

test('creates a state with timer-related state', t => {
  const state = actions.Init(
    {},
    {
      timerId: 'test',
      externals: {
        documentElement: {},
        Notification: {},
      },
    },
  );
  t.snapshot(state);
});

test('can set custom language', t => {
  const [state, _] = actions.Init(
    {},
    {
      timerId: 'test',
      externals: {
        documentElement: {},
        Notification: {},
      },
      lang: 'uk_UA',
    },
  );

  t.deepEqual(state.lang, i18n.withMissing(i18n.uk_UA));
});

test('defaults to en_CA if lang is not found', t => {
  const [state, _] = actions.Init(
    {},
    {
      timerId: 'test',
      externals: {
        documentElement: {},
        Notification: {},
      },
      lang: 'foobar',
    },
  );

  t.deepEqual(state.lang, i18n.en_CA);
});
