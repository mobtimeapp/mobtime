// Update with your config settings.

const defaults = {
  client: 'sqlite3',
  migrations: {
    tableName: 'knex_migrations',
    directory: './database/migrations',
  },
  useNullAsDefault: true,
};

module.exports = {
  test: {
    ...defaults,
    connection: {
      filename: './database/test.sqlite3',
    },
  },

  development: {
    ...defaults,
    connection: {
      filename: './database/development.sqlite3',
    },
  },

  staging: {
    ...defaults,
    connection: {
      filename: './database/staging.sqlite3',
    },
  },

  production: {
    ...defaults,
    connection: {
      filename: './database/production.sqlite3',
    },
  },
};
