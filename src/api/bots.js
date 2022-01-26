import express from 'express';
import { Queue } from '../queue';

export default () => {
  const router = new express.Router();

  const queue = new Queue();

  const authMiddleware = (request, response, next) => {
    return queue
      .validateBotTimerToken(
        request.headers['x-mobtime-timer-id'],
        request.headers['x-mobtime-bot-token'],
      )
      .then(() => next())
      .catch(err => {
        return response.status(401).json(err.toString());
      });
  };

  router.get('/token', (request, response) => {
    const timerId = request.headers['x-mobtime-timer-id'];
    return queue
      .getBotTimerToken(timerId)
      .then(token => {
        return token
          ? token
          : queue.generateBotTimerToken(timerId, request.headers.host);
      })
      .then(token => response.json(token))
      .catch(err => response.json(err.toString()));
  });

  router.get('/test', authMiddleware, (_request, response) =>
    response.json('ok'),
  );

  return router;
};
