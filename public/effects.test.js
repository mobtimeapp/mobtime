import test from 'ava';
import sinon from 'sinon';

import * as effects from './effects';

const makeWebsocket = () => ({
  send: sinon.fake(),
});

const runEffect = ([fn, props], dispatch = () => {}) => fn(dispatch, props);

test('can send update settings message', t => {
  const payload = {
    type: 'settings:update',
    settings: { foo: 'bar' },
  };
  const websocket = makeWebsocket();
  runEffect(
    effects.UpdateSettings({
      websocket,
      settings: payload.settings,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send broadcast join message', t => {
  const payload = { type: 'client:new' };
  const websocket = makeWebsocket();
  runEffect(
    effects.BroadcastJoin({
      websocket,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send start timer message', t => {
  const payload = { type: 'timer:start', timerDuration: 1000 };
  const websocket = makeWebsocket();
  runEffect(
    effects.StartTimer({
      websocket,
      timerDuration: payload.timerDuration,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send pause timer message', t => {
  const payload = { type: 'timer:pause', timerDuration: 1000 };
  const websocket = makeWebsocket();
  runEffect(
    effects.PauseTimer({
      websocket,
      timerDuration: payload.timerDuration,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send complete timer message', t => {
  const payload = { type: 'timer:complete' };
  const websocket = makeWebsocket();
  runEffect(
    effects.CompleteTimer({
      websocket,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send start break timer message', t => {
  const payload = { type: 'break:start-timer' };
  const websocket = makeWebsocket();
  runEffect(
    effects.StartBreakTimer({
      websocket,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send finish break message', t => {
  const payload = { type: 'break:finish' };
  const websocket = makeWebsocket();
  runEffect(
    effects.FinishBreak({
      websocket,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send update goals message', t => {
  const payload = { type: 'goals:update', goals: [] };
  const websocket = makeWebsocket();
  runEffect(
    effects.UpdateGoals({
      websocket,
      goals: payload.goals,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('can send update mob message', t => {
  const payload = { type: 'mob:update', mob: [] };
  const websocket = makeWebsocket();
  runEffect(
    effects.UpdateMob({
      websocket,
      mob: payload.mob,
    }),
  );

  t.truthy(websocket.send.calledOnceWithExactly(JSON.stringify(payload)));
});

test('cannot request notification permission when no notification object given', t => {
  const SetNotificationPermissions = sinon.fake();
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({ SetNotificationPermissions }),
    dispatch,
  );

  t.truthy(
    SetNotificationPermissions.calledOnceWithExactly(fakeState, {
      notificationPermissions: 'denied',
      Notification: undefined,
      documentElement: undefined,
    }),
  );
});

test('can request notification permission, and send value back to action', async t => {
  const SetNotificationPermissions = sinon.fake();
  const Notification = {
    requestPermission: () => Promise.resolve('denied'),
  };
  const documentElement = {};
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({
      SetNotificationPermissions,
      Notification,
      documentElement,
    }),
    dispatch,
  );

  await new Promise(resolve => setTimeout(resolve, 0));

  t.truthy(
    SetNotificationPermissions.calledOnceWithExactly(fakeState, {
      notificationPermissions: 'denied',
      Notification,
      documentElement,
    }),
  );
});

test('can request notification permission, and handle exception', async t => {
  const SetNotificationPermissions = sinon.fake();
  const Notification = {
    requestPermission: () => Promise.reject(new Error('foo')),
  };
  const documentElement = {};
  const fakeState = {};
  const dispatch = (action, props) => action(fakeState, props);

  runEffect(
    effects.NotificationPermission({
      SetNotificationPermissions,
      Notification,
      documentElement,
    }),
    dispatch,
  );

  await new Promise(resolve => setTimeout(resolve, 0));

  // t.truthy(SetNotificationPermissions.calledOnceWithExactly(fakeState, ''));
  t.truthy(
    SetNotificationPermissions.calledOnceWithExactly(fakeState, {
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
