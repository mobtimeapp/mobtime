import express from 'express';
import bodyParser from 'body-parser';

export default (dispatch, action, storage) => {
  const router = new express.Router();
  router.use(bodyParser.json());

  router.post('/recaptcha', (request, response) => {
    console.log(request.body);
    return response.status(204).end();
  });

  return router;
};

