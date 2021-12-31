import express from 'express';

export default storage => {
  const router = new express.Router();

  router.get('/statistics', (_request, response) => {
    const state = storage.read();
    const timerIds = Object.keys(state.statistics || {});
    const timerStatistics = timerIds.reduce(
      (counts, id) => ({
        connections: counts.connections + state.statistics[id].connections,
      }),
      { connections: 0 },
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
