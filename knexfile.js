// Update with your config settings.

module.exports = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: './database/test.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
    useNullAsDefault: true,
  },

  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/development.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
  },

  staging: {
    client: 'sqlite3',
    connection: {
      filename: './database/staging.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './database/production.sqlite3',
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

};
