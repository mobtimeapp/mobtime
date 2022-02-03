import { createClient } from 'redis';

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

  listTimers() {
    return this.client().then(c =>
      c
        .keys('timer_*')
        .then(timers => timers.map(timerId => timerId.replace(/^timer_/, ''))),
    );
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
      Promise.all([
        c.set(`timer_${timerId}`, JSON.stringify(data)),
        c.expire(`timer_${timerId}`, 60 * 60 * 24 * 3),
      ]),
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
