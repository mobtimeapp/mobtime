import test from 'ava';

import * as State from '../../state.js';

test('after init', t => {
  const state = State.initial('foo', {});

  t.deepEqual(State.getLocal(state), {
    time: null,
    isOwner: false,
    modal: null,
    giphySearch: '',
    giphyResults: [],
    autoSaveTimers: [],
    messageHistory: [null, null, null, null, null],
    hasLoaded: false,
  });
});

test('manage current time', t => {
  const now = Date.now();
  const state = State.setLocalCurrentTime(State.initial('foo', {}), now);

  t.is(State.getLocalCurrentTime(state), now);
});

test('manage modal', t => {
  const modal = 'test';
  const state = State.setLocalModal(State.initial('foo', {}), modal);

  t.is(State.getLocalModal(state), modal);
});

test('manage auto save timers', t => {
  const timerId = 'foo';
  let state = State.initial(timerId, {});

  t.falsy(State.isLocalAutoSaveTimer(state));
  state = State.localAutoSaveTimerAdd(state);
  t.deepEqual(State.getLocalAutoSaveTimers(state), [timerId]);
  t.truthy(State.isLocalAutoSaveTimer(state));
  state = State.localAutoSaveTimerRemove(state);
  t.deepEqual(State.getLocalAutoSaveTimers(state), []);
});
