'use strict';

const { DataTypes } = require('sequelize');

module.exports = (db, sequelize, Sequelize) => {

  let Client = sequelize.define('client', {

    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'clientName',
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'displayName',
    },

  }, {});

  return Client;

}
