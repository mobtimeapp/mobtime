/* eslint-disable no-console */

import express from 'express';
import ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import { URL } from 'url';
import path from 'path';

import apiTimer from './api/timer';
import apiMob from './api/mob';
import apiGoals from './api/goals';
import apiStatistics from './api/statistics';
import apiPing from './api/ping';

import { database } from './database';

const isTimerOnBlacklist = (timer_id) => database // eslint-disable-line camelcase
  .select('timer_id', 'created_at')
  .from('blacklist')
  .where({ timer_id })
  .whereRaw("strftime('%s', created_at) > strftime('%s', 'now', '-1 hour')")
  .then((results) => results.length > 0)
  .catch((error) => {
    console.log('Unable to check blacklist');
    console.log({ timer_id });
    console.log(error);
    console.log('');
    return false;
  });


const HttpSub = (bus, storage, action, host = 'localhost', port = 4321) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

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


  authorizedRouter.use('/timer', apiTimer(dispatch, action, storage));
  authorizedRouter.use('/mob', apiMob(dispatch, action, storage));
  authorizedRouter.use('/goals', apiGoals(dispatch, action, storage));
  authorizedRouter.use(apiPing(dispatch, action, storage));

  router.use(apiStatistics(dispatch, action, storage));
  router.use(authorizedRouter);

  app.use('/api', router);

  const rootPath = path.resolve(__dirname, '..');
  app.use(express.static(path.resolve(rootPath, 'public')));

  app.get('/:timerId', async (request, response) => {
    const isOnBlacklist = await isTimerOnBlacklist(request.params.timerId);
    if (isOnBlacklist) {
      return response.status(418).end();
    }

    const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
    return response.sendFile(htmlPayload);
  });

  server.listen(port, host, () => {
    console.log(`Local server up: http://${host}:${port}`);
  });

  wss.on('connection', async (client, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    client.$token = Math.random().toString(36).slice(2); // eslint-disable-line no-param-reassign
    const [timerId] = url.pathname.split('/').filter((v) => v);
    client.$timerId = timerId; // eslint-disable-line no-param-reassign

    const isOnBlacklist = await isTimerOnBlacklist(client.$timerId);
    if (isOnBlacklist) {
      client.close(1013, 'Blacklist');
      return;
    }

    const timer = getTimer(client.$timerId);
    if (!timer) {
      console.log('websocket requested timer that does not exist, creating new timer', client.$timerId);
      await dispatch(action.AddTimer(client.$timerId));
    }

    await dispatch(action.AddToken(client.$token, client.$timerId));
    client.send(JSON.stringify({
      type: 'token',
      token: client.$token,
      state: getTimer(client.$timerId),
    }));

    client.on('close', () => {
      if (!client.$timerId) return;

      dispatch(action.RemoveToken(client.$token, client.$timerId));
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
