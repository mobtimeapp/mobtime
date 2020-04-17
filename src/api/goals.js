import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.get('/add/:goal', (request, response) => {
    const timer = storage.read()[request.timerId];

    if (timer.goals.length >= 5) {
      return response
        .status(403)
        .json({ message: 'Too many goals' })
        .end();
    }

    dispatch(action.AddGoal(request.params.goal, request.timerId));

    return response.status(204).end();
  });
  router.get('/:goal/complete', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goal, true, request.timerId));

    return response.status(204).end();
  });
  router.get('/:goal/uncomplete', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goal, false, request.timerId));

    return response.status(204).end();
  });
  router.get('/remove/:goal', (request, response) => {
    dispatch(action.RemoveGoal(request.params.goal, request.timerId));

    return response.status(204).end();
  });

  return router;
};
