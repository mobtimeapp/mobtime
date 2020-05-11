import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.get('/reset', async (request, response) => {
    await dispatch(action.ResetTimer(request.token, request.timerId));

    return response
      .status(204)
      .end();
  });

  router.get('/start/:seconds', (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    const numberOfSeconds = Number(seconds);

    dispatch(action.StartTimerFromSeconds(numberOfSeconds, request.token, request.timerId));

    return response.status(201).end();
  });

  router.get('/start', (request, response) => {
    dispatch(action.StartTimer(request.token, request.timerId));

    return response.status(201).end();
  });

  router.get('/resume', (request, response) => {
    const { timerDuration } = storage.read()[request.timerId];
    dispatch(action.StartTimerFromSeconds(timerDuration, request.token, request.timerId));

    return response.status(201).end();
  });

  router.get('/pause', (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    dispatch(action.PauseTimer(request.token, request.timerId));

    return response.status(201).end();
  });

  return router;
};
