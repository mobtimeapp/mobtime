import * as redis from 'redis';
import { effects } from 'ferp';
import { promisify } from 'util';
import { RelayMessage } from './websocket';

const { batch, defer, thunk, none, act } = effects;

const RedisSubscriberSub = (dispatch, actions, redisUrl, timerId) => {
  console.log('RedisSubscriber', 'at least one subscriber on timer', timerId);
  const redisConnection = redis.createClient(redisUrl);

  redisConnection.on('message', (_channel, data) => {
    console.log('RedisSubscriber.message', data);
    const { type } = JSON.parse(data);

    return dispatch(actions.MessageTimer(timerId, data), 'MessageTimer');
  });

  redisConnection.subscribe(timerId);

  return () => {
    console.log('RedisSubscriber', 'no more subscribers on timer', timerId);
    redisConnection.unsubscribe(timerId);
    redisConnection.quit();
  };
};
export const RedisSubscriber = (...props) => [RedisSubscriberSub, ...props];

const RedisPublisherSub = (dispatch, actions, redisUrl) => {
  const redisConnection = redis.createClient(redisUrl);

  redisConnection.on('ready', () => {
    const redisProxy = {
      get: promisify(redisConnection.get).bind(redisConnection),
      set: promisify(redisConnection.set).bind(redisConnection),
      expire: promisify(redisConnection.expire).bind(redisConnection),
      publish: (...args) => redisConnection.publish(...args),
    };
    dispatch(actions.SetRedisConnection(redisProxy));
  });

  redisConnection.on('end', () => {
    dispatch(actions.SetRedisConnection(null));
  });

  return () => {
    redisConnection.quit();
  };
};
export const RedisPublisher = (...props) => [RedisPublisherSub, ...props];

const messageToPartialState = message => {
  const json = JSON.parse(message);
  switch (json.type) {
    case 'mob:update':
      return { mob: json.mob };
    case 'goals:update':
      return { goals: json.goals };
    case 'settings:update':
      return { settings: json.settings };
    case 'timer:start':
      return { timerDuration: json.timerDuration };
    case 'timer:pause':
      return { timerDuration: json.timerDuration };
    case 'timer:complete':
      return { timerDuration: null };
    default:
      return {};
  }
};

export const WriteCacheTimerState = (redisConnection, message, timerId) =>
  defer(
    redisConnection
      .get(timerId)
      .then(timer => JSON.parse(timer ? timer.toString() : '{}'))
      .then(timer =>
        JSON.stringify({
          ...timer,
          ...messageToPartialState(message),
        }),
      )
      .then(timer => redisConnection.set(timerId, timer))
      .then(() => redisConnection.expire(timerId, 5 * 24 * 60 * 60))
      .catch(err => {
        console.log('WriteCacheTimerState.error', err.toString());
        return null;
      })
      .then(() => none()),
  );

export const ShareCacheTimerState = (connection, redisConnection, timerId) =>
  defer(
    redisConnection
      .get(timerId)
      .then(timer => JSON.parse(timer.toString()))
      .catch(() => ({}))
      .then(timer =>
        batch([
          timer.mob
            ? RelayMessage(
                connection,
                JSON.stringify({ type: 'mob:update', mob: timer.mob }),
              )
            : none(),
          timer.goals
            ? RelayMessage(
                connection,
                JSON.stringify({ type: 'goals:update', goals: timer.goals }),
              )
            : none(),
          timer.settings
            ? RelayMessage(
                connection,
                JSON.stringify({
                  type: 'settings:update',
                  settings: timer.settings,
                }),
              )
            : none(),
        ]),
      ),
  );
