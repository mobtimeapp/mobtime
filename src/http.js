/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import apiStatistics from './api/statistics';

const HttpSub = (dispatch, action, host = 'localhost', port = 4321) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

  app.use(bodyParser.json());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: 'unsafe-none',
      crossOriginEmbedderPolicy: false,
      frameguard: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const router = new express.Router();

  router.use((_request, response, next) => {
    try {
      return next();
    } catch (err) {
      console.log('error');
      console.log(err);
      return response
        .status(500)
        .json({ message: err.toString() })
        .end();
    }
  });

  router.use(apiStatistics());

  app.use('/api', router);

  const rootPath = path.resolve(__dirname, '..');
  app.use(express.static(path.resolve(rootPath, 'public')));

  app.get('/:timerId', async (_request, response) => {
    const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
    const html = await fs.promises.readFile(htmlPayload, { encoding: 'utf8' });

    return response.status(200).send(html);
  });

  server.listen(port, host, () => {
    console.log(`Local server up: http://${host}:${port}`);
  });

  wss.on('connection', async (client, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const timerId = url.pathname.replace('/', '');

    await dispatch(action.AddConnection(client, timerId), 'AddConnection');
  });

  return () => {
    wss.close();
    http.close();
  };
};
export const Http = (...props) => [HttpSub, ...props];
