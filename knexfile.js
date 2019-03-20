// Update with your config settings.
require('dotenv').config();

module.exports = {

  development: {
    client: 'pg',
//xs    version: '7.2',
    connection: {
      host : 'db',
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,
      port: 5432, //env var: PGPORT
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
//    version: '7.2',
    connection: {
      host : 'db',
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,
      port: 5432, //env var: PGPORT
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

/*  development: {
    client: 'mysql',
    connection: {
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  }
  */

};
