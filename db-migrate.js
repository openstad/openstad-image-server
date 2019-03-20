"use strict";

const config = require("./knexfile");
const Knex = require("knex");

const knex = Knex(config);

async function runMigrations(retries, delay) {
  for (let i = 1; i !== retries; i++) {
    try {
      return await knex.migrate.latest();
    } catch (err) {
      await setTimeoutAsync(delay * i);
    }
  }

  throw new Error(`Unable to run migrations after ${retries} attempts.`);
}

function setTimeoutAsync(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

runMigrations(10, 500)
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(res => {
    console.log(`Batch ${res[0]} run: ${res[1].length} migrations`);
    console.log(res[1].join("\n"));
    process.exit();
  });
