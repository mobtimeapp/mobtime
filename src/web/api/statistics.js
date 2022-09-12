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
      const timerIds = await queue.listTimers();
      const getStats = (timerId, type) =>
        (stats[timerId] && stats[timerId][type]) || 0;
      timerStatistics = timerIds.reduce(
        (counts, id) => ({
          connections: counts.connections + getStats(id, 'connections'),
          mobbers: counts.mobbers + getStats(id, 'mobbers'),
          timerIds: counts.timerIds + 1,
        }),
        { connections: 0, mobbers: 0, timerIds: 0 },
      );
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
