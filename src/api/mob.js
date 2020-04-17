import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  const getTimer = (timerId) => storage.read()[timerId];

  router.get('/add/:name', (request, response) => {
    const { name } = request.params;
    const { mob, lockedMob } = getTimer(request.timerId);

    if (mob.includes(name)) {
      return response
        .status(400)
        .json({ message: 'User is already in mob' })
        .end();
    }

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.AddUser(name, request.timerId));

    return response.status(201).end();
  });

  router.get('/remove/:name', (request, response) => {
    const { name } = request.params;
    const { lockedMob } = getTimer(request.timerId);

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.RemoveUser(name, request.timerId));

    return response.status(201).end();
  });

  router.get('/cycle', (request, response) => {
    dispatch(action.CycleMob(request.timerId));

    return response.status(204).end();
  });

  router.get('/shuffle', (request, response) => {
    const { lockedMob } = getTimer(request.timerId);

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.ShuffleMob(request.timerId));

    return response.status(204).end();
  });

  router.get('/lock', (request, response) => {
    dispatch(action.LockMob(request.timerId));

    return response.status(204).end();
  });

  router.get('/unlock', (request, response) => {
    dispatch(action.UnlockMob(request.timerId));

    return response.status(204).end();
  });

  return router;
};
