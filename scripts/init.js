const db = require('db');
const hat = require('hat');

(async () => {

  await db.sequelize.sync({ force: true });

  const rack = hat.rack();
  const clientToken = process.env.FIRST_IMAGE_API_ACCESS_TOKEN ? process.env.FIRST_IMAGE_API_ACCESS_TOKEN : rack();

  await db.Client.create({
    clientName: 'First client',
    token: clientToken,
    displayName: "First client for frontend",
  })

  process.exit();

})();
