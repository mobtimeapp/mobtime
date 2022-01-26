import { app } from 'ferp';
import * as Action from './actions';
import { Http } from './http';
import { Websocket } from './websocket';
import { Queue } from './queue';
import { cpus } from 'os';
import cluster from 'cluster';
import process from 'process';

const workers = Number(process.env.WORKERS) || 1;
const port = process.env.APP_PORT || 1234;
const host = process.env.APP_HOST || 'localhost';

const run = () => {
  app({
    init: Action.Init(new Queue()),

    subscribe: state => {
      const timerIds = Object.keys(state.connections).sort();

      return [
        Http(Action, host, port),

        ...timerIds.reduce((subs, timerId) => [
          ...subs,
          ...state.connections[timerId].map(connection => (
            Websocket(Action, connection, connection.timerId)
          )),
        ], []),

        ...timerIds.map((timerId) => (
          state.queue.subscribeToTimer(
            timerId,
            Action.MessageTimer,
          )
        )),
      ];
    },
  });
}

if ((workers > 1 || workers === -1) && cluster.isPrimary) {
  const num = workers < 0
    ? cpus().length
    : workers;


  for (let i = 0; i < num; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Server (${worker.process.pid}) died`, { code, signal });
  });

} else {
  run();

  console.log(`Server (${process.pid}) running`);
}
