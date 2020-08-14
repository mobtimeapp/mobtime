/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import apiStatistics from './api/statistics';

const HttpSub = (bus, storage, action, host = 'localhost', port = 4321) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

  dotenv.config();

  app.use(bodyParser.json());
  app.use(helmet());

  const getTimer = (timerId) => {
    const timer = storage.read()[timerId];
    if (!timer) return null;

    const { tokens, ...publicPayload } = timer;

    return {
      ...publicPayload,
      connections: tokens.length,
    };
  };

  const broadcast = (payload, timerId) => {
    const message = JSON.stringify(payload);
    let client;
    for (client of wss.clients) {
      if (client.$timerId !== timerId) continue;

      try {
        client.send(message);
      } catch (err) {
        console.log('Error sending message to client, disconnecting', client.$token);
        client.close();
      }
    }
  };

  const findTimerIdByToken = (token, timers) => {
    const timerIds = Object.keys(timers);
    let timerId;
    for (timerId of timerIds) {
      if (timers[timerId].tokens.includes(token)) {
        return timerId;
      }
    }
    return null;
  };

  const router = new express.Router();

  router.use((_request, response, next) => {
    try {
      return next();
    } catch (err) {
      console.log(err);
      return response.status(500).json({ message: err.toString() }).end();
    }
  });

  const authorizedRouter = new express.Router();
  authorizedRouter.use((request, response, next) => {
    const token = (request.headers.authorization || '').replace(/^token /, '');
    const timerId = findTimerIdByToken(token, storage.read());

    if (!token || !timerId) {
      return response
        .status(401)
        .json({ message: 'Invalid token, include `Authorization: token <token>` in your request' })
        .end();
    }

    request.timerId = timerId;
    request.token = token;
    return next();
  });


  router.use(apiStatistics(dispatch, action, storage));
  router.use(authorizedRouter);

  app.use('/api', router);

  const rootPath = path.resolve(__dirname, '..');
  app.use(express.static(path.resolve(rootPath, 'public')));

  app.get('/:timerId', async (request, response) => {

    const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
    const initialHtml = await fs.promises.readFile(htmlPayload, { encoding: 'utf8' });
    const html = initialHtml.replace(/\{\{RECAPTCHA_PUBLIC\}\}/g, process.env.RECAPTCHA_PUBLIC);

    return response
      .status(200)
      .send(html)
      .end();
  });

  server.listen(port, host, () => {
    console.log(`Local server up: http://${host}:${port}`);
  });


  wss.on('connection', async (client, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const [_, timerId] = url.pathname.split('/').filter((v) => v);

    client.$timerId = timerId; // eslint-disable-line no-param-reassign

    await dispatch(action.AddConnection(client, client.$timerId, true));

    client.on('close', () => {
      dispatch(action.RemoveToken(client.$token, client.$timerId));
      // Need action.RemoveConnection(client);
    });

    return undefined;
  });

  const cancelBusSubscription = bus.subscribe((data) => {
    switch (data.type) {
      case 'tick':
        return broadcast({
          type: 'tick',
          state: getTimer(data.timerId),
        }, data.timerId);

      case 'notify':
        return broadcast({
          type: 'notify',
          message: data.message,
          state: getTimer(data.timerId),
        }, data.timerId);

      default:
        return undefined;
    }
  });

  return () => {
    cancelBusSubscription();
    http.close();
    wss.close();
  };
};
export const Http = (...props) => [HttpSub, ...props];
