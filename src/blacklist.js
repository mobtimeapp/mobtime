/* eslint-disable no-console */

import { effects } from 'ferp';

import { database } from './database';

export const BlacklistEffect = (
  timer_id, // eslint-disable-line camelcase
  reason = null,
) => effects.defer(
  database('blacklist')
    .insert({ timer_id, reason })
    .catch((error) => {
      console.log('Error adding information to blacklist');
      console.log({ timer_id, reason, now: (new Date()).toISOString() });
      console.log(error);
    })
    .then(effects.none),
);
