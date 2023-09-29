/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import * as ws from 'ws';
import http from 'http';
import helmet from 'helmet';
import { URL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import process from 'process';
import apiStatistics from './api/statistics.js';
import apiConsole from './api/console.js';

const HttpSub = (dispatch, action, host = 'localhost', port = 4321) => {
  const app = express();
  const server = http.createServer(app);
  const wss = new ws.WebSocketServer({
    server,
    clientTracking: false,
  });

  const log = (...data) => console.log('[Http]', ...data);

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

  const tryMiddleware = (_request, response, next) => {
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
  };

  app.use('/api', tryMiddleware, apiStatistics());
  app.use('/console', apiConsole());

  const rootPath = path.resolve(process.cwd());
  app.use(express.static(path.resolve(rootPath, 'public')));

  app.get('/:timerId', async (request, response) => {
    const htmlPayload = path.resolve(rootPath, 'public', 'timer.html');
    const html = await fs.readFile(htmlPayload, { encoding: 'utf8' });

    log('http.connect', request.params.timerId);

    return response.status(200).send(html);
  });

  app.post('/:timerId/timer/start', async (request, response) => {
    const { timerId } = request.params;

    const completeToken = Math.random().toString(36).slice(-6);
    await dispatch(action.SetCompleteToken(timerId, completeToken), 'SetCompleteToken');

    const message = JSON.stringify({
      type: 'timer:start',
      timerDuration: request.body.duration,
      completeToken,
    });

    await dispatch(action.UpdateTimer(timerId, message), 'UpdateTimer');

    return response.status(202).json({ completeToken });
  });

  app.post('/:timerId/timer/pause', async (request, response) => {
    const { timerId } = request.params;
    const { token, duration } = request.body;

    console.log('http timer pause', { timerId, token, duration }, request.body);

    await dispatch(action.PauseTimer(timerId, token, duration), 'PauseTimer');
    return response.status(202).json({});
  });

  app.post('/:timerId/timer/complete', async (request, response) => {
    const { timerId } = request.params;
    const { token } = request.body;

    const responder = (success) => {
      return response.status(success ? 202 : 410).json({});
    };

    await dispatch(action.CompleteTimer(timerId, token, responder), 'CompleteTimer');
  });

  app.post('/:timerId/timer/settings', async (request, response) => {
    const { timerId } = request.params;
    const { settings } = request.body;

    await dispatch(action.UpdateTimer(timerId, JSON.stringify({ type: 'settings:update', settings })), 'UpdateTimer');
    return response.status(202).json({});
  });

  server.listen(port, host, () => {
    console.log(`Local server up: http://${host}:${port}`);
  });

  wss.on('connection', async (client, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const timerId = url.pathname.replace('/', '');
    log('websocket.connect', timerId);
    client.on('close', () => {
      log('websocket.disconnect', timerId);
    });

    await dispatch(action.AddConnection(client, timerId), 'AddConnection');
  });

  return () => {
    wss.close();
    http.close();
  };
};
export const Http = (...props) => [HttpSub, ...props];
