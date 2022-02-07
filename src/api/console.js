import express from 'express';
import { createClient } from 'redis';

const TOKEN_KEY = process.env.TOKEN_KEY;

const connectToRedis = () => {
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || 6379;
  const redis = createClient({
    url: `redis://${redisHost}:${redisPort}`,
  });
  const redisConnectPromise = redis.connect();
  const query = () => redisConnectPromise.then(() => redis);

  return { query };
};

export default () => {
  const router = new express.Router();
  if (!TOKEN_KEY) return router;

  const { query } = connectToRedis();

  const getToken = () => query().then(client => client.get(TOKEN_KEY));

  const validateToken = async suppliedToken => {
    const token = await getToken();
    return suppliedToken === token;
  };

  const generateToken = async (_request, _response, next) => {
    let token = await getToken();
    if (!token) {
      token = Math.random()
        .toString(36)
        .slice(2);
      await query().then(client =>
        Promise.all([
          client.set(TOKEN_KEY, token),
          client.expire(TOKEN_KEY, 60 * 60 * 24),
        ]),
      );
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('console token:', token);
    }
    next();
  };

  const authorizeToken = async (request, response, next) => {
    let token = request.headers['x-token'];
    if (!token) {
      return response.status(401).end();
    }
    token = Buffer.from(token, 'base64').toString('ascii');
    if (!(await validateToken(token))) {
      return response.status(401).end();
    }

    next();
  };

  router.use((_request, response, next) => {
    response.set('Content-Type', 'application/json');
    next();
  });

  router.use(generateToken);
  router.use(authorizeToken);

  router.get('/timers.json', async (request, response) => {
    const client = await query();

    const MATCH = `timer_${request.query.search || '*'}`;

    let keys = [];
    for await (let key of client.scanIterator({ MATCH })) {
      keys.push(
        Promise.all([client.get(key), client.ttl(key)]).then(
          ([timer, expireAt]) => ({
            timer: JSON.parse(timer || '{}'),
            timerId: key.replace(/^timer_/, ''),
            expireAt: Date.now() + expireAt * 1000,
          }),
        ),
      );
    }

    const timers = await Promise.all(keys);

    return response.json(timers.sort((a, b) => b.expireAt > a.expireAt)).end();
  });

  return router;
};
