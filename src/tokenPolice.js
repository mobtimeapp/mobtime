/* eslint-disable no-console */

import { effects } from 'ferp';

import { database } from './database';

const NUMBER_OF_SECONDS_TO_LOOK_BACK = 5000;
const NUMBER_OF_TOKEN_ISSUES_TO_CONSIDER_BLACKLIST = 10;

export const TokenPoliceEffect = (
  timer_id, // eslint-disable-line camelcase
  onDetectedEffect = effects.none,
) => effects.defer(
  database
    .select('action', 'timer_id', 'created_at')
    .from('audit')
    .where({ action: 'AddToken', timer_id })
    .whereRaw("strftime('%s', created_at) > ?", [(Date.now() - NUMBER_OF_SECONDS_TO_LOOK_BACK) / 1000])
    .limit(20)
    .then((results) => (results.length < NUMBER_OF_TOKEN_ISSUES_TO_CONSIDER_BLACKLIST
      ? effects.none()
      : onDetectedEffect(timer_id, 'Police effect detected too many tokens being issued')
    ))
    .catch((error) => {
      console.log('Unable to check audit for token flooding');
      console.log({ timer_id });
      console.log(error);
      console.log('');

      return effects.none();
    }),
);
