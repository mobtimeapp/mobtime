export const up = (knex) => knex.schema.createTable('audit', (table) => {
  table.increments();
  table.string('timer_id');
  table.string('token');
  table.string('action');
  table.string('parameters');
  table.timestamps();
});

export const down = (knex) => knex.schema.dropTable('audit');
