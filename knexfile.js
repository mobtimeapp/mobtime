// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/dev.sqlite3'
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
