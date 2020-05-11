import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.post('/settings', async (request, response) => {
    const {
      duration,
    } = request.body;

    await dispatch(action.UpdateSettings({
      duration,
    }, request.token, request.timerId));

    return response.status(204).end();
  });

  return router;
};
