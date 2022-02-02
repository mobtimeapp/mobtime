import test from 'ava';
import sinon from 'sinon';

import * as effects from './effects';

const runEffect = ([fn, props], dispatch = () => {}) => fn(dispatch, props);

const makeEmitter = () => ({ emit: sinon.fake() });

test('can send update settings message', t => {
  const payload = {
    type: 'settings:update',
    settings: { foo: 'bar' },
  };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.UpdateSettings({
      socketEmitter,
      settings: payload.settings,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send start timer message', t => {
  const payload = { type: 'timer:start', timerDuration: 1000 };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.StartTimer({
      socketEmitter,
      timerDuration: payload.timerDuration,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send pause timer message', t => {
  const payload = { type: 'timer:pause', timerDuration: 1000 };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.PauseTimer({
      socketEmitter,
      timerDuration: payload.timerDuration,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send complete timer message', t => {
  const payload = { type: 'timer:complete' };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.CompleteTimer({
      socketEmitter,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send update goals message', t => {
  const payload = { type: 'goals:update', goals: [] };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.UpdateGoals({
      socketEmitter,
      goals: payload.goals,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send update mob message', t => {
  const payload = { type: 'mob:update', mob: [] };
  const socketEmitter = makeEmitter();
  runEffect(
    effects.UpdateMob({
      socketEmitter,
      mob: payload.mob,
    }),
  );

  t.truthy(socketEmitter.emit.calledOnceWithExactly(JSON.stringify(payload)));
});

test('cannot request notification permission when no notification object given', t => {
  const UpdateNotificationPermissions = sinon.fake();
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({ UpdateNotificationPermissions }),
    dispatch,
  );

  t.truthy(
    UpdateNotificationPermissions.calledOnceWithExactly(fakeState, {
      notificationPermissions: 'denied',
      Notification: undefined,
      documentElement: undefined,
    }),
  );
});

test('can request notification permission, and send value back to action', async t => {
  const UpdateNotificationPermissions = sinon.fake();
  const Notification = {
    requestPermission: () => Promise.resolve('denied'),
  };
  const documentElement = {};
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({
      UpdateNotificationPermissions,
      Notification,
      documentElement,
    }),
    dispatch,
  );

  await new Promise(resolve => setTimeout(resolve, 0));

  t.truthy(
    UpdateNotificationPermissions.calledOnceWithExactly(fakeState, {
      notificationPermissions: 'denied',
      Notification,
      documentElement,
    }),
  );
});

test('can request notification permission, and handle exception', async t => {
  const UpdateNotificationPermissions = sinon.fake();
  const Notification = {
    requestPermission: () => Promise.reject(new Error('foo')),
  };
  const documentElement = {};
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({
      UpdateNotificationPermissions,
      Notification,
      documentElement,
    }),
    dispatch,
  );

  await new Promise(resolve => setTimeout(resolve, 0));

  t.truthy(
    UpdateNotificationPermissions.calledOnceWithExactly(fakeState, {
      notificationPermissions: 'denied',
      Notification,
      documentElement,
    }),
  );
});

test('can create a notification', t => {
  const Notification = sinon.fake(function _Notification(title, options) {
    this.title = title;
    this.options = options;
    return this;
  });

  const title = 'Test';
  const text = '1 2 3';

  runEffect(
    effects.Notify({
      title,
      text,
      notification: true,
      Notification,
    }),
  );

  t.truthy(
    Notification.calledOnceWithExactly(title, {
      body: text,
      vibrate: [100, 100, 100],
    }),
  );
});

test('can skip a notification when notification is false', t => {
  const Notification = sinon.fake(function _Notification(title, options) {
    this.title = title;
    this.options = options;
    return this;
  });

  const title = 'Test';
  const text = '1 2 3';

  runEffect(
    effects.Notify({
      title,
      text,
      notification: false,
      Notification,
    }),
  );

  t.falsy(
    Notification.calledOnceWithExactly(title, {
      body: text,
      vibrate: [100, 100, 100],
    }),
  );
});

test('can play a sound', t => {
  const play = sinon.fake();
  const documentElement = {
    querySelector: () => ({
      play,
    }),
  };

  runEffect(
    effects.Notify({
      sound: true,
      documentElement,
    }),
  );

  t.truthy(play.calledOnceWithExactly());
});

test('can update the document title from remainingTime', t => {
  const documentElement = { title: '' };

  runEffect(
    effects.UpdateTitleWithTime({
      remainingTime: 1000,
      documentElement,
    }),
  );

  t.is(documentElement.title, '00:01 - mobtime');
});

test('can update the document title with no remaining time', t => {
  const documentElement = { title: '' };

  runEffect(
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      documentElement,
    }),
  );

  t.is(documentElement.title, 'mobtime');
});

test('can schedule the next action', t => {
  const dispatch = sinon.fake();
  const action = () => {};
  const props = {};

  runEffect(
    effects.andThen({
      action,
      props,
    }),
    dispatch,
  );

  t.truthy(dispatch.calledOnceWithExactly(action, props));
});
