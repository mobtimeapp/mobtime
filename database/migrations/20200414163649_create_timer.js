
exports.up = (knex) => knex
  .schema
  .createTable('timers', (table) => {
    table.increments('id').primary();
    table.string('slug', 64).unique();
    table.biginteger('timerStartedAt').unsigned().nullable();
    table.biginteger('timerDuration').unsigned();
    table.boolean('is_expired');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex
  .schema
  .dropTableIfExists('timers');
