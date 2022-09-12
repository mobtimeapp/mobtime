import { app } from 'ferp';
import * as Action from './actions';
import { Http } from './http';
import { Websocket } from './websocket';
import { Queue } from './queue';
import process from 'process';

const port = process.env.APP_PORT || 1234;
const host = process.env.APP_HOST || 'localhost';

export const run = () => {
  app({
    init: Action.Init(new Queue()),

    subscribe: state => {
      const timerIds = Object.keys(state.connections).sort();

      return [
        Http(Action, host, port),

        ...timerIds.reduce(
          (subs, timerId) => [
            ...subs,
            ...state.connections[timerId].map(connection =>
              Websocket(Action, connection, connection.timerId),
            ),
          ],
          [],
        ),

        ...timerIds.map(timerId =>
          state.queue.subscribeToTimer(timerId, Action.MessageTimer),
        ),
      ];
    },
  });
};
