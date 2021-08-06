import * as redis from 'redis';
import { effects } from 'ferp';

const { thunk, none, act } = effects;

// What happens when you connect to a timer:
//
// 1. { type: 'client:new' } => NodeJS/Mobtime Server
// 2. Anyone on the timer? If so, who is the first connection ("owner")
// 3. If there was an owner...
// 3.a they will send the full timer state to you
// 3.b { type: 'ownership', owner: false }
// 4. If there was no owner, there is no timer, you are the owner
// 4.a { type: 'ownership', owner: true }
//
//
// NodeJS Server A [Bob, Greg]
// NodeJS Server B [Joyce, Billy]

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
    dispatch(actions.SetRedisConnection(redisConnection));
  });

  redisConnection.on('end', () => {
    dispatch(actions.SetRedisConnection(null));
  });

  return () => {
    redisConnection.quit();
  };
};
export const RedisPublisher = (...props) => [RedisPublisherSub, ...props];

export const WriteCacheTimerState = (redisConnection, partialState, timerId) =>
  thunk(() => {
    console.log('TODO: Write partial stuff and other stuff');
    return none();
  });

export const ShareCacheTimerState = (
  connection,
  redisConnection,
  partialState,
  timerId,
) =>
  thunk(() => {
    console.log('TODO: Read partial stuff and other stuff');
    console.log('TODO: Send state to conneciton.websocket');
    return none();
  });
