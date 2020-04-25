export const up = (knex) => knex.schema.createTable('blacklist', (table) => {
  table.increments();
  table.string('timer_id');
  table.string('reason');
  table.timestamp('created_at').defaultTo(knex.fn.now());
});

export const down = (knex) => knex.schema.dropTable('blacklist');
