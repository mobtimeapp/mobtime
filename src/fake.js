import express from 'express';
import { networkInterfaces } from 'os';

const port = Number(process.env.PORT) || 4321;

const app = express();

const ip = []
  .concat(...Object.values(networkInterfaces()))
  .find(x => !x.internal && x.family === 'IPv4');

const address = ip ? ip.address : 'unknown';

app.use((_request, response) => {
  response
    .status(200)
    .send(`IP: ${address}`)
    .end();
});

app.listen(port, () => {
  console.log(`Server ready http://${address}:${port}`); // eslint-disable-line no-console
});
