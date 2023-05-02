'use strict';

const { Sequelize } = require('sequelize');

let ssl;
if (process.env.MYSQL_CA_CERT) {
  ssl = {
    ca: process.env.MYSQL_CA_CERT
  }
}

let sequelize = new Sequelize({

  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT || '3306',

  ssl,

  dialect: process.env.DB_DIALECT || 'mysql',

 	logging: null,
  // logging: console.log,

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

// invoke associations and scopes
for (let modelName in sequelize.models) {
  let model = sequelize.models[modelName];
  if (model.associate) model.associate();
  let scopes = model.scopes && model.scopes() || {};
  for (let scopeName in scopes) {
		model.addScope(scopeName, scopes[scopeName], {override: true});
  }
  model.prototype.toJSON = function(params) {
    let result = {};
    for (let key in this.dataValues) {
      let target = this.dataValues[key];
      if (target && target.toJSON) {
        result[key] = target.toJSON(params);
      } else {
        result[key] = target;
      }
    }
    return result;
  }
}

module.exports = db;
