import test from 'ava';

import { getMigrations, runMigrations } from './migrations';

import initialMigration from '../migrations/0000_initialSchema';

test('we get at least the initial migration first', async (t) => {
  const migrations = await getMigrations();

  t.is(migrations[0], initialMigration);
});

test('we get an array of functions from getMigrations', async (t) => {
  const migrations = await getMigrations();

  t.truthy(migrations.every((fn) => typeof fn === 'function'));
});

test('can run migrations against an empty object timer', (t) => {
  const initialTimer = {
    tokens: ['abc'],
  };
  const migrations = [initialMigration];

  t.deepEqual(runMigrations(migrations, initialTimer), {
    mob: [],
    lockedMob: null,
    timerStartedAt: null,
    timerDuration: 0,
    goals: [],
    tokens: [],
    expiresAt: (Date.now() + (30 * 60 * 1000)),
    settings: {
      duration: (5 * 60 * 1000) + 900,
    },
  });
});
