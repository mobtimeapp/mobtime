import { createClient } from 'redis';
import { effects } from 'ferp';

export class Queue {
  constructor(createClientFn = createClient) {
    this._client = createClientFn();
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
    return effects.defer(
      Queue.publishFx(timerId, data, this._getSubscription(timerId)),
    );
  }

  getTimer(timerId) {
    return this.client()
      .then(c => c.get(`timer_${timerId}`)
      .then(payload => payload || '{}')
      .then(JSON.parse));
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
}

Queue.subscribeFx = (dispatch, timerId, client, onActivity) => {
  client.on('ready', () => {
    client.subscribe(timerId, (_channel, data) => {
      dispatch(onActivity(data));
    });
  });

  return () => {
    client.unsubscribe(timerId);
  };
};

Queue.publishFx = (timerId, data, client) => {
  return new Promise(resolve => {
    client.on('ready', () => {
      client
        .publish(timerId, data)
        .catch(err => {
          console.error('Queue.publishFx', err);
        })
        .then(() => resolve(effects.none()));
    });
  });
};

Queue.forTesting = () => {
  const memory = {};
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
    get: (key) => Promise.resolve(memory[key]),
    persist: (_key) => {},
    expireAt: (_key, _time) => {},
  });

  return new Queue(makeClient);
}
