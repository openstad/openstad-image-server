
exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table) {
    table.increments();
    table.string('clientName').notNullable();
    table.string('token').notNullable();
    table.string('displayName').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('clients');
};
