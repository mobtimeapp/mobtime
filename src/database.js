import knex from 'knex';
import configurations from '../knexfile';

const environment = process.env.NODE_ENV || 'development';

export const connection = knex(configurations[environment]);

const activeTimers = () => connection('timers').where({ is_expired: false });

export const createTimer = async (slug, attrs) => {
  const {
    goals: _goals,
    tokens: _tokens,
    lockedMob: _lockedMob,
    mob: _mob,
    expiresAt: _expiresAt,
    ...timer
  } = attrs;

  const result = await connection('timers')
    .insert({
      ...timer,
      slug,
      isExpired: false,
    });

  return result;
};

export const pingTimer = async (timer) => {
  const result = await activeTimers()
    .where({ slug: timer.slug, isExpired: false })
    .update({ updated_at: new Date() });

  return result;
};
