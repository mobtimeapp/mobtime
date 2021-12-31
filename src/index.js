import { app, sub } from 'ferp';
import * as Action from './actions';
import * as storage from './storage';
import { Http } from './http';
import { Websocket } from './websocket';
import { Queue } from './queue';

const port = process.env.PORT || 1234;
const Storage = storage.make();

app({
  init: Action.Init(new Queue()),

  subscribe: state => {
    const timerIds = Array.from(
      new Set(state.connections.map(c => c.timerId))
    ).sort();

    return [
      Http(Storage, Action, 'localhost', port),
      ...state.connections.map((connection) => (
        Websocket(Action, connection, connection.timerId)
      )),
      ...timerIds.map((timerId) => (
        state.queue.subscribeToTimer(
          timerId,
          Action.MessageTimer,
        )
      )),
    ];
  },
});
