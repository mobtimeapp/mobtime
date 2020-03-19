import express from 'express';
import ws from 'ws';
import http from 'http';
import path from 'path';
import ngrok from 'ngrok';

const HttpSub = (bus, storage, action, host = 'localhost', port = 4321) => (dispatch) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.Server({ server });

  const broadcast = (payload) => {
    const message = JSON.stringify(payload);
    let client;
    for(client of wss.clients) {
      try {
        client.send(message);
      } catch (err) {
        console.log('Error sending message to client, disconnecting', client._token);
        client.close();
      }
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
  router.get('/status', (_request, response) => {
    return response
      .status(201)
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
  router.get('/mob/remove/:name', authMiddleware, (request, response) => {
    const { name } = request.params;

    dispatch(action.RemoveUser(name));

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
    const { timerDuration } = storage.read().data;
    dispatch(action.StartTimer(timerDuration));

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
    ngrok.connect({ proto: 'http', port })
      .then((url) => {
        console.log(`>> Server at: ${url} (share this one!)`);
        console.log(`>>  Local at: http://${host}:${port}/`);
      });
  });

  const getState = () => {
    const { data } = storage.read();

    return {
      ...data,
    };
  };

  wss.on('connection', async (client) => {
    const token = Math.random().toString(36).slice(2);
    client._token = token;

    await dispatch(action.AddToken(token));
    await dispatch(action.SyncTimer());

    client.send(JSON.stringify({
      type: 'token',
      token,
      state: getState(),
    }));

    client.on('close', () => {
      dispatch(action.RemoveToken(token));
    });
  });

  const cancelBusSubscription = bus.subscribe((data) => {
    switch (data.type) {
    case 'tick':
      return broadcast({ type: 'tick', state: getState() });

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
