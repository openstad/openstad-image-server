'use strict';

const { Sequelize } = require('sequelize');

let dialectOptions;
if (process.env.MYSQL_CA_CERT) {
  dialectOptions = {
    ssl: {
      ca: process.env.MYSQL_CA_CERT
    }
  }
}

let sequelize = new Sequelize({

  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT || '3306',

  dialectOptions,

  dialect: process.env.DB_DIALECT || 'mysql',

  define: {
    underscored: true,
  },

  pool: {
    max: process.env.maxPoolSize || 5,
  },

});

let db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// add models
db.Client = require('./model/client')(db, sequelize, Sequelize);

// invoke associations
for (let modelName in sequelize.models) {
  if (sequelize.models[modelName].associate) sequelize.models[modelName].associate();
}

module.exports = db;
