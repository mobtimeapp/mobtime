import knex from 'knex';
import configurations from '../knexfile';

const environment = process.env.NODE_ENV || 'development';

export const database = knex(configurations[environment]);
