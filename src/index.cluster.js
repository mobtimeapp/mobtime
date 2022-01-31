import { run } from './server.js';
import { cpus } from 'os';
import cluster from 'cluster';
import process from 'process';

const workers = Number(process.env.WORKERS) || 1;

if ((workers > 1 || workers === -1) && cluster.isPrimary) {
  const num = workers < 0 ? cpus().length : workers;

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
