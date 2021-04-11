import express from 'express';

export default storage => {
  const router = new express.Router();

  router.get('/statistics', (_request, response) => {
    const state = storage.read();
    const timerIds = Object.keys(state.statistics);
    const timerStatistics = timerIds.reduce(
      (counts, id) => ({
        mobbers: counts.mobbers + state.statistics[id].mobbers,
        connections: counts.connections + state.statistics[id].connections,
        goals: counts.goals + state.statistics[id].goals,
      }),
      { mobbers: 0, connections: 0, goals: 0 },
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
