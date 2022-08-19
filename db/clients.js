const knex = require('../knex/knex.js');
const bookshelf = require('bookshelf')(knex);
const clients = bookshelf.Model.extend({
  tableName: 'clients',
  requireFetch: false,
  hasTimestamps: true,
  hasTimestamps: ['created_at', 'updated_at']
});

exports.clients = clients;

exports.findByToken = function(token, cb) {
  process.nextTick(function() {
    clients
      .fetchAll()
      .then(function (records) {
        records = records.serialize();
        
        for (var i = 0, len = records.length; i < len; i++) {
          var record = records[i];
          if (record.token === token) {
            return cb(null, record);
          }
        }

        return cb(null, null);
    });
  });
}
