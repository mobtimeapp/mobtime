import express from 'express';
import { Queue } from './queue';

export default () => {
  const router = new express.Router();
  const queue = new Queue();

  router.get('/statistics', (_request, response) => {
    const stats = queue.getStatistics();
    const timerIds = Object.keys(stats || {});
    const timerStatistics = timerIds.reduce(
      (counts, id) => ({
        connections: counts.connections + stats[id].connections,
        mobbers: counts.mobbers + stats[id].connections,
      }),
      { connections: 0, mobbers: 0 },
    );

    return response
      .status(200)
      .json({
        timers: timerIds.length,
        ...timerStatistics,
      })
      .end();
  });

  return router;
};
