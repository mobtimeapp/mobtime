import express from 'express';
import ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import path from 'path';

const HttpSub = (bus, storage, action, host = 'localhost', port = 4321, singleTimer = true) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

  const getTimer = timerId => {
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
    for(client of wss.clients) {
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
    for(timerId of timerIds) {
      if (timers[timerId].tokens.includes(token)) {
        return timerId;
      }
    }
    return null;
  };

  const timerMiddleware = (request, response, next) => {
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

    next();
  };

  const router = new express.Router();

  router.use((_request, response, next) => {
    try {
      next()
    } catch (err) {
      console.log(err);
      return response.status(500).json({ message: err.toString() }).end()
    }
  });

  router.use(timerMiddleware);

  router.get('/ping', timerMiddleware, async (request, response) => {
    await dispatch(action.SyncTimer(request.timerId));
    await dispatch(action.PingTimer(request.timerId));

    return response
      .status(201)
      .end();
  });
  router.get('/reset', timerMiddleware, async (request, response) => {
    await dispatch(action.ResetTimer(request.timerId));

    return response
      .status(201)
      .end();
  });
  router.get('/mob/add/:name', timerMiddleware, (request, response) => {
    const { name } = request.params;
    const { mob } = storage.read()[request.timerId];

    if (mob.includes(name)) {
      return response
        .status(400)
        .json({ message: 'User is already in mob' })
        .end();
    }

    dispatch(action.AddUser(name, request.timerId));

    return response.status(201).end();
  });
  router.get('/mob/remove/:name', timerMiddleware, (request, response) => {
    const { name } = request.params;

    dispatch(action.RemoveUser(name, request.timerId));

    return response.status(201).end();
  });
  router.get('/mob/cycle', timerMiddleware, (request, response) => {
    dispatch(action.CycleMob(request.timerId));

    return response.status(201).end();
  });
  router.get('/mob/shuffle', timerMiddleware, (request, response) => {
    dispatch(action.ShuffleMob(request.timerId));

    return response.status(201).end();
  });
  router.get('/timer/start/:seconds', timerMiddleware, (request, response) => {
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
  router.get('/timer/resume', timerMiddleware, (_request, response) => {
    const { timerDuration } = storage.read().data;
    dispatch(action.StartTimer(timerDuration, request.timerId));

    return response.status(201).end();
  });
  router.get('/timer/pause', timerMiddleware, (request, response) => {
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

  if (singleTimer) {
    app.use('/timer', (_request, response) => {
      dispatch(action.AddTimer('timer'));
      const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
      return response.sendFile(htmlPayload);
    });

    app.get('/', (_request, response) => {
      return response.redirect('/timer');
    });

    app.use(express.static(path.resolve(rootPath, 'public')));
  } else {
    app.use(express.static(path.resolve(rootPath, 'public')));

    app.get('/:timerId', async (request, response) => {
      await dispatch(action.AddTimer(request.params.timerId));
      const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
      return response.sendFile(htmlPayload);
    });
  }

  server.listen(port, host, () => {
    console.log(`Local server up: http://${host}:${port}`);
  });

  wss.on('connection', (client) => {
    const token = Math.random().toString(36).slice(2);
    client.$token = token;

    client.on('message', async (timerId) => {
      if (!timerId) return;

      const timer = storage.read()[timerId];
      if (!timer) {
        console.log('websocket requested timer that does not exist, closing', timer);
        return client.close();
      }

      client.$timerId = timerId;
      await dispatch(action.AddToken(token, timerId));

      client.send(JSON.stringify({
        type: 'token',
        token,
        state: getTimer(timerId),
      }));

      await dispatch(action.SyncTimer(timerId));
    });

    client.on('close', () => {
      if (!client.$timerId) return;

      dispatch(action.RemoveToken(client.$token, client.$timerId));
    });
  });

  const cancelBusSubscription = bus.subscribe((data) => {
    switch (data.type) {
    case 'tick':
      return broadcast({
        type: 'tick',
        state: getTimer(data.timerId),
      }, data.timerId);

    default:
      break;
    }
  });

  return () => {
    cancelBusSubscription();
    http.close();
    wss.close();
  };
};
export const Http = (...props) => [HttpSub, ...props];
