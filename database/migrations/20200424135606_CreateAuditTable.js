exports.up = (knex) => knex.createTable('audit', (table) => {
  table.increments();
  table.string('timer_id');
  table.string('token');
  table.string('action');
  table.string('parameters');
  table.timestamps();
});

exports.down = (knex) => knex.dropTable('audit');
