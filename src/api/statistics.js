import express from 'express';

export default (_dispatch, _action, storage) => {
  const router = new express.Router();

  router.get('/statistics', (_request, response) => {
    const state = storage.read();
    const timerIds = Object.keys(state);
    const timerStatistics = timerIds.reduce((counts, id) => ({
      mobbers: counts.mobbers + state[id].mob.length,
      connections: counts.connections + state[id].tokens.length,
      goals: counts.goals + state[id].goals.length,
    }), { mobbers: 0, connections: 0, goals: 0 });

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
