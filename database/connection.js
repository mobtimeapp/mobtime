import knex from 'knex';
import path from 'path';

export const get = () => knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
});
