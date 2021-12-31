import { createClient } from 'redis';
import { effects } from 'ferp';

export class Queue {
  constructor() {
    this.client = createClient();
    this.subscriptions = {};
  }

  _getSubscription(timerId) {
    if (!this.subscriptions[timerId]) {
      this.subscriptions[timerId] = this.client.duplicate();
      this.subscriptions[timerId].connect();
    }
    return this.subscriptions[timerId];
  }

  subscribeToTimer(timerId, onActivity) {
    return [
      Queue.subscribeFx,
      {
        timerId,
        client: this._getSubscription(timerId),
        onActivity,
      },
    ];
  }

  publishToTimer(timerId, data) {
    return effects.defer(
      Queue.publishFx(timerId, data, this._getSubscription(timerId)),
    );
  }

  getTimer(timerId) {
    return this.client.get(`timer_${timerId}`).then(JSON.parse);
  }

  setTimer(timerId, data) {
    return this.client.set(`timer_${timerId}`, JSON.stringify(data));
  }

  mergeTimer(timerId, mergeFn) {
    return this.getTimer(timerId)
      .then(mergeFn)
      .then(timer => this.setTimer(timerId, timer));
  }

  getStatistics() {
    return this.client.get('statistics').then(JSON.parse);
  }

  setStatistics(statistics) {
    return this.client.set('statistics', JSON.stringify(statistics));
  }

  mergeStatistics(timerId, mergeFn) {
    return this.getStatistics()
      .then(statistics => ({
        ...statistics,
        [timerId]: mergeFn(statistics[timerId]),
      }))
      .then(statistics => this.setStatistics(statistics));
  }
}

Queue.subscribeFx = (dispatch, { timerId, client, onActivity }) => {
  client.on('ready', () => {
    client.subscribe(timerId, (_channel, data) => {
      dispatch(onActivity(data));
    });
  });

  return () => {
    client.unsubscribe(timerId);
    client.quit();
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
