export const up = (database) => database
  .schema
  .withSchema('public')
  .createTable('timers', (table) => {
    table.increments('id').primary();
    table.string('slug', 64).unique();
    table.text('mob').defaultTo('[]');
    table.biginteger('timerStartedAt').nullable().defaultTo(null);
    table.biginteger('timerDuration').defaultTo(0);
    table.text('goals').defaultTo('[]');
    table.timestamps(true, true);
  });

export const down = (database) => database
  .schema
  .withSchema('public')
  .dropTableIfExists('timers');
