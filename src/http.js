import express from 'express';
import ws from 'ws';
import http from 'http';
import path from 'path';

const HttpSub = (bus, storage, action, host = 'localhost', port = 4321) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

  const broadcast = (payload) => {
    const message = JSON.stringify(payload);
    let client;
    for(client of wss.clients) {
      client.send(message);
    }
  };

  const authMiddleware = (request, response, next) => {
    const token = (request.headers.authorization || '')
      .replace(/^token /, '');

    if (!token || !storage.read().tokens.includes(token)) {
      return response
        .status(401)
        .json({ message: 'Invalid token, include `Authorization: token <token>` in your request' })
        .end();
    }

    next();
  };

  const router = new express.Router();
  router.get('/', (_request, response) => {
    return response
      .status(200)
      .json(storage.read().data)
      .end();
  });
  router.get('/mob/add/:name', authMiddleware, (request, response) => {
    const { name } = request.params;
    const { mob } = storage.read().data;

    if (mob.includes(name)) {
      return response
        .status(400)
        .json({ message: 'User is already in mob' })
        .end();
    }

    dispatch(action.AddUser(name));

    return response.status(201).end();
  });
  router.get('/mob/cycle', authMiddleware, (_request, response) => {
    dispatch(action.CycleMob());

    return response.status(201).end();
  });
  router.get('/mob/shuffle', authMiddleware, (_request, response) => {
    dispatch(action.ShuffleMob());

    return response.status(201).end();
  });
  router.get('/timer/start/:seconds', authMiddleware, (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    const numberOfSeconds = Number(seconds);

    dispatch(action.StartTimer(numberOfSeconds));

    return response.status(201).end();
  });
  router.get('/timer/resume', authMiddleware, (_request, response) => {
    const { timerRemaining } = storage.read().data;
    dispatch(action.StartTimer(timerRemaining));

    return response.status(201).end();
  });
  router.get('/timer/pause', authMiddleware, (request, response) => {
    const { seconds } = request.params;

    if (Number.isNaN(seconds)) {
      return response
        .status(400)
        .json({ message: 'The seconds provided is not a number' })
        .end();
    }

    dispatch(action.PauseTimer());

    return response.status(201).end();
  });

  app.use('/api', router);
  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  server.listen(port, host, () => {
    console.log(`>> Server running on http://${host}:${port}/`);
  });

  wss.on('connection', (client) => {
    const token = Math.random().toString(36).slice(2);
    console.log('websocket', token, 'connected');
    dispatch(action.AddToken(token));
    client.send(JSON.stringify({
      type: 'token',
      token,
      state: storage.read().data,
    }));

    client.on('close', () => {
      console.log('websocket', token, 'disconnected');
      dispatch(action.RemoveToken(token));
    });
  });

  const cancelBusSubscription = bus.subscribe((data) => {
    switch (data.type) {
    case 'tick':
      return broadcast({ type: 'tick', state: storage.read().data });

    case 'complete':
      return broadcast({ type: 'complete', state: storage.read().data });

    default:
      break;
    }
  });

  return () => {
    cancelBusSubscription();
    http.close();
  };
};
export const Http = (...props) => [HttpSub, ...props];
