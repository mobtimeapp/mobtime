import { createClient } from 'redis';
import { effects } from 'ferp';

export class Queue {
  constructor(createClientFn = createClient) {
    this._client = createClientFn({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env
        .REDIS_PORT || 6379}`,
    });
    this._clientPromise = this._client.connect();
    this.subscriptions = {};
  }

  client() {
    return this._clientPromise.then(() => this._client);
  }

  _getSubscription(timerId) {
    if (!this.subscriptions[timerId]) {
      this.subscriptions[timerId] = this._client.duplicate();
      this.subscriptions[timerId].connect();
    }
    return this.subscriptions[timerId];
  }

  subscribeToTimer(timerId, onActivity) {
    return [
      Queue.subscribeFx,
      timerId,
      this._getSubscription(timerId),
      onActivity,
    ];
  }

  publishToTimer(timerId, data) {
    return this.client()
      .then(c => c.publish(timerId, data))
      .catch(err => {
        console.error('Queue.publishFx', err);
        throw err;
      });
  }

  getTimer(timerId) {
    return this.client().then(c =>
      c
        .get(`timer_${timerId}`)
        .then(payload => payload || '{}')
        .then(JSON.parse),
    );
  }

  setTimer(timerId, data) {
    return this.client().then(c =>
      c.set(`timer_${timerId}`, JSON.stringify(data)),
    );
  }

  setTimerTtl(timerId, ttl) {
    return this.client().then(c =>
      ttl > 0
        ? c.expireAt(`timer_${timerId}`, parseInt(new Date() / 1000) + ttl)
        : c.persist(`timer_${timerId}`),
    );
  }

  mergeTimer(timerId, mergeFn) {
    return this.getTimer(timerId)
      .then(mergeFn)
      .then(timer => this.setTimer(timerId, timer));
  }

  getStatistics() {
    return this.client()
      .then(c => c.get('statistics'))
      .then(payload => payload || '{}')
      .then(JSON.parse);
  }

  setStatistics(statistics) {
    return this.client().then(c =>
      c.set('statistics', JSON.stringify(statistics)),
    );
  }

  mergeStatistics(timerId, mergeFn) {
    return this.getStatistics()
      .then(statistics => ({
        ...statistics,
        [timerId]: mergeFn(statistics[timerId] || {}),
      }))
      .then(statistics => this.setStatistics(statistics));
  }

  getBotTimerToken(timerId) {
    if (!timerId) {
      return Promise.reject(new Error('invalid timer id'));
    }
    return this.client()
      .then(c => c.get(`bot_token_${timerId}`))
      .then(payload => payload || null);
  }

  generateBotTimerToken(timerId, domain) {
    return this.client().then(c => {
      const token = Buffer.from(
        JSON.stringify({
          domain: domain || 'mobti.me',
          key: Math.random()
            .toString(36)
            .slice(2),
          createdAt: Date.now(),
        }),
      ).toString('base64');

      const key = `bot_token_${timerId}`;
      return c
        .set(key, token)
        .then(() => c.expireAt(key, parseInt(new Date() / 1000) + 6 * 60 * 60))
        .then(() => token);
    });
  }

  validateBotTimerToken(timerId, tokenFromRequest) {
    return this.getBotTimerToken(timerId).then(tokenFromRedis => {
      const internal = JSON.parse(
        Buffer.from(tokenFromRedis, 'base64').toString('ascii'),
      );

      const external = JSON.parse(
        Buffer.from(tokenFromRequest, 'base64').toString('ascii'),
      );

      if (internal.key !== external.key) {
        throw new Error('key mismatch');
      }
      if (internal.domain !== external.domain) {
        throw new Error('domain mismatch');
      }
      if (internal.createdAt !== external.createdAt) {
        throw new Error('timstamp mismatch');
      }

      return this.client().then(c =>
        c.expireAt(
          `bot_token_${timerId}`,
          parseInt(new Date() / 1000) + 6 * 60 * 60,
        ),
      );
    });
  }
}

Queue.subscribeFx = (dispatch, timerId, client, onActivity) => {
  client.subscribe(timerId, data => {
    dispatch(onActivity(timerId, data));
  });

  return () => {
    client.unsubscribe(timerId);
  };
};

Queue.forTesting = (initialMemory = {}) => {
  const memory = initialMemory;
  const makeClient = () => ({
    connect: () => Promise.resolve(),
    duplicate: () => makeClient(),
    subscribe: () => {},
    on: (_event, cb) => {
      cb();
    },
    publish: () => Promise.resolve(),
    set: (key, value) => {
      memory[key] = value;
      return Promise.resolve();
    },
    get: key => Promise.resolve(memory[key]),
    persist: _key => {},
    expireAt: (_key, _time) => {},
  });

  return new Queue(makeClient);
};
