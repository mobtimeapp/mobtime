import express from 'express';
import { networkInterfaces } from 'os';
import * as redis from 'redis';

const port = Number(process.env.PORT) || 4321;
const redisUrl = process.env.REDIS_URL;

const app = express();

const ip = []
  .concat(...Object.values(networkInterfaces()))
  .find(x => !x.internal && x.family === 'IPv4');

const address = ip ? ip.address : 'unknown';

const pub = redis.createClient(redisUrl);
// const sub = redis.createClient({ host: 'redis' });

// sub.on('subscribe', (channel, count) => {
// console.log('redis.subscribe', address, channel, count);
// pub.publish('mobtime', address);
// });

// sub.on('message', (channel, message) => {
// console.log('redis.message', channel, message);
// });

app.use((_request, response) => {
  response
    .status(200)
    .send(`IP: ${address}`)
    .end();
});

app.listen(port, () => {
  console.log(`Server ready http://${address}:${port}`); // eslint-disable-line no-console
});

process.on('exit', () => {
  // sub.unsubscribe();
  pub.quit();
  // sub.quit();
});

// sub.subscribe('mobtime');
