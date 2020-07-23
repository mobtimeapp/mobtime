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

  router.get('/move/:sourceIndex/to/:destinationIndex', (request, response) => {
    const sourceIndex = Number(request.params.sourceIndex);
    const destinationIndex = Number(request.params.destinationIndex);

    if (Number.isNaN(sourceIndex) || Number.isNaN(destinationIndex)) {
      return response
        .status(400)
        .json({
          message: 'You must provide and source and desintation indexes',
          sourceIndex,
          destinationIndex,
        })
        .end();
    }

    dispatch(action.MoveGoal(sourceIndex, destinationIndex, request.token, request.timerId));

    return response.status(204).end();
  });

  router.get('/rename/:goalId/:newName', (request, response) => {
    const { goalId, newName } = request.params;

    if (newName.length < 3) {
      return response
        .status(400)
        .json({
          message: 'You must provide a name with at least 3 characters',
        })
        .end();
    }

    dispatch(action.RenameGoal(
      goalId,
      newName,
      request.token,
      request.timerId,
    ));

    return response.status(204).end();
  });

  return router;
};
