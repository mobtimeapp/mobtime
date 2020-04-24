import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.get('/ping', async (request, response) => {
    const timer = storage.read()[request.timerId];

    if (!timer) {
      return response
        .status(205)
        .json({ message: 'Timer does not exist, or has expired. Please refresh application to continue' })
        .end();
    }

    await dispatch(action.PingTimer(request.token, request.timerId));

    return response
      .status(204)
      .end();
  });

  return router;
};
