import express from 'express';
import { Queue } from '../queue';

const CACHE_TTL = 1000 * 60;

export default () => {
  const router = new express.Router();
  const queue = new Queue();
  let cache = {
    value: { connections: 0, mobbers: 0, timerIds: 0 },
    time: Date.now() - CACHE_TTL - 1,
  };

  router.get('/statistics', async (_request, response) => {
    let timerStatistics = cache.value;
    if (Date.now() - cache.time > CACHE_TTL) {
      const stats = await queue.getStatistics();
      timerIds = Object.keys(stats || {});
      timerStatistics = timerIds.reduce(
        (counts, id) => ({
          connections: counts.connections + stats[id].connections,
          mobbers:
            stats[id].connections > 0
              ? counts.mobbers + stats[id].mobbers
              : counts.mobbers,
        }),
        { connections: 0, mobbers: 0 },
      );
      timerStatistics.timerIds = timerIds.length;
      cache = {
        value: timerStatistics,
        time: Date.now(),
      };
    }

    return response
      .status(200)
      .json(timerStatistics)
      .end();
  });

  return router;
};
