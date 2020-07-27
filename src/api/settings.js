import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.post('/settings', async (request, response) => {
    const {
      duration,
      mobOrder,
    } = request.body;

    const payload = {
      ...(duration ? { duration } : {}),
      ...(mobOrder ? { mobOrder } : {}),
    };

    await dispatch(action.UpdateSettings(
      payload,
      request.token,
      request.timerId,
    ));

    return response.status(204).end();
  });

  return router;
};
