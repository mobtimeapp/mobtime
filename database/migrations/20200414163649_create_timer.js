
exports.up = (knex) => knex
  .schema
  .createTable('timers', (table) => {
    table.increments('id').primary();
    table.string('slug', 64);
    table.biginteger('timerStartedAt').unsigned().nullable();
    table.biginteger('timerDuration').unsigned();
    table.boolean('isExpired');
    table.timestamps(true, true);
  });

exports.down = (knex) => knex
  .schema
  .dropTableIfExists('timers');
