/* eslint-disable no-console */

import express from 'express';
import ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import { URL } from 'url';
import path from 'path';

const HttpSub = (bus, storage, action, host = 'localhost', port = 4321) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

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

  app.use(helmet());

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

  router.get('/statistics', (_request, response) => {
    const state = storage.read();
    const timerIds = Object.keys(state);
    const timerStatistics = timerIds.reduce((counts, id) => ({
      mobbers: counts.mobbers + state[id].mob.length,
      connections: counts.connections + state[id].tokens.length,
      goals: counts.goals + state[id].goals.length,
    }), { mobbers: 0, connections: 0, goals: 0 });

    return response
      .status(200)
      .json({
        timers: timerIds.length,
        ...timerStatistics,
      })
      .end();
  });

  router.use((request, response, next) => {
    const token = (request.headers.authorization || '')
      .replace(/^token /, '');
    const timerId = findTimerIdByToken(token, storage.read());

    if (!token || !timerId) {
      return response
        .status(401)
        .json({ message: 'Invalid token, include `Authorization: token <token>` in your request' })
        .end();
    }

    request.timerId = timerId;

    return next();
  });

  router.get('/ping', async (request, response) => {
    const timer = getTimer(request.timerId);
    if (!timer) {
      return response
        .status(205)
        .json({ message: 'Timer does not exist, or has expired. Please refresh application to continue' })
        .end();
    }

    await dispatch(action.PingTimer(request.timerId));

    return response
      .status(204)
      .end();
  });
  router.get('/timer/reset', async (request, response) => {
    await dispatch(action.ResetTimer(request.timerId));

    return response
      .status(204)
      .end();
  });
  router.get('/mob/add/:name', (request, response) => {
    const { name } = request.params;
    const { mob, lockedMob } = storage.read()[request.timerId];

    if (mob.includes(name)) {
      return response
        .status(400)
        .json({ message: 'User is already in mob' })
        .end();
    }
    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.AddUser(name, request.timerId));

    return response.status(201).end();
  });
  router.get('/mob/remove/:name', (request, response) => {
    const { name } = request.params;
    const { lockedMob } = storage.read()[request.timerId];

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.RemoveUser(name, request.timerId));

    return response.status(201).end();
  });
  router.get('/mob/goals/add/:goal', (request, response) => {
    const timer = getTimer(request.timerId);
    if (timer.goals.length >= 5) {
      return response
        .status(403)
        .json({ message: 'Too many goals' })
        .end();
    }

    dispatch(action.AddGoal(request.params.goal, request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/goals/:goal/complete', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goal, true, request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/goals/:goal/uncomplete', (request, response) => {
    dispatch(action.CompleteGoal(request.params.goal, false, request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/goals/remove/:goal', (request, response) => {
    dispatch(action.RemoveGoal(request.params.goal, request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/cycle', (request, response) => {
    dispatch(action.CycleMob(request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/shuffle', (request, response) => {
    const { lockedMob } = getTimer(request.timerId);

    if (lockedMob) {
      return response
        .status(400)
        .json({ message: 'Mob is locked' })
        .end();
    }

    dispatch(action.ShuffleMob(request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/lock', (request, response) => {
    dispatch(action.LockMob(request.timerId));

    return response.status(204).end();
  });
  router.get('/mob/unlock', (request, response) => {
    dispatch(action.UnlockMob(request.timerId));

    return response.status(204).end();
  });
  router.get('/timer/start/:seconds', (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    const numberOfSeconds = Number(seconds);

    dispatch(action.StartTimer(numberOfSeconds, request.timerId));

    return response.status(201).end();
  });
  router.get('/timer/resume', (request, response) => {
    const { timerDuration } = storage.read()[request.timerId];
    dispatch(action.StartTimer(timerDuration, request.timerId));

    return response.status(201).end();
  });
  router.get('/timer/pause', (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    dispatch(action.PauseTimer(request.timerId));

    return response.status(201).end();
  });

  app.use('/api', router);

  const rootPath = path.resolve(__dirname, '..');

  app.use(express.static(path.resolve(rootPath, 'public')));

  app.get('/:timerId', async (request, response) => {
    await dispatch(action.AddTimer(request.params.timerId));
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

    const timer = getTimer(client.$timerId);
    if (!timer) {
      console.log('websocket requested timer that does not exist, closing', timer);
      return client.close();
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
