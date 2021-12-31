import { createClient } from 'redis';
import { effects } from 'ferp';

export class Queue {
  constructor() {
    this._client = createClient();
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
    return this.client().then(c => c.get(`timer_${timerId}`).then(JSON.parse));
  }

  setTimer(timerId, data) {
    return this.client().then(c =>
      c.set(`timer_${timerId}`, JSON.stringify(data)),
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
      .then(JSON.parse)
      .then(v => v || {});
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
  console.log('>>> subscribeFx', timerId);
  client.on('ready', () => {
    client.subscribe(timerId, (_channel, data) => {
      dispatch(onActivity(data));
    });
  });

  return () => {
    console.log('>>> subscribeFx.cancel', timerId);
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
