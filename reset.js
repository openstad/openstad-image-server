require('dotenv').config();

const fs = require('fs').promises;
const constants = require('fs').constants;
const db = require('./db');

async function doReset() {

  try {

    console.log('Syncing...');

    await db.sequelize.sync({force: true})

    console.log('Adding default data...');
    let datafile = process.env.NODE_ENV || 'default';
    try {
      await fs.access(`./seeds/${datafile}`, constants.F_OK)
    } catch(err) {
      datafile = 'default';
    }
	  await require(`./seeds/${datafile}`)(db);

  } catch (err) {
    console.log(err);
  } finally {
	  db.sequelize.close();
  }
  
}

doReset();
