import express from 'express';

export default (dispatch, action, storage) => {
  const router = new express.Router();

  router.get('/add/:goal', (request, response) => {
    dispatch(action.AddGoal(request.params.goal, request.token, request.timerId));

    return response.status(204).end();
  });
  router.get('/complete/:goalId', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goalId, true, request.token, request.timerId));

    return response.status(204).end();
  });
  router.get('/uncomplete/:goalId', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goalId, false, request.token, request.timerId));

    return response.status(204).end();
  });
  router.get('/remove/:goalId', (request, response) => {
    dispatch(action.RemoveGoal(request.params.goalId, request.token, request.timerId));

    return response.status(204).end();
  });

  return router;
};
