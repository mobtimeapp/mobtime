import { app, sub } from 'ferp';
import * as storage from './storage';
import * as Action from './actions';
import { Http } from './http';
import { Websocket } from './websocket';
import { RedisSubscriber, RedisPublisher } from './redis';

const port = process.env.PORT || 1234;
const redisUrl = process.env.REDIS_URL || 'redis://redis';

const Storage = storage.make();

app({
  init: Action.Init(),

  subscribe: state => {
    const timerIds = Array.from(
      new Set(
        state.connections.map(c => c.timerId)
      ),
    );

    let connectionWebsocketSubscriptions = [];
    if (state.redisConnection) {
      connectionWebsocketSubscriptions = state
        .connections
        .map((connection) => (
          Websocket(Action, connection, state.redisConnection, connection.timerId)
        ));
    }

    return [
      Http(Storage, Action, '0.0.0.0', port),
      RedisPublisher(Action, redisUrl),
      ...connectionWebsocketSubscriptions,
      timerIds.map((timerId) => (
          RedisSubscriber(Action, redisUrl, timerId)
      )),
    ];
  },

  observe: ([state], action) => {
    Storage.store(state);
  },
});
