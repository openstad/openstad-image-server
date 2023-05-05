const hat = require('hat');

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

module.exports = async function seed(db) {

  const rack = hat.rack();
  const clientToken = process.env.FIRST_IMAGE_API_ACCESS_TOKEN ? process.env.FIRST_IMAGE_API_ACCESS_TOKEN : rack();
  console.log('---->> seeds', clientToken);

  // Inserts seed entries
  await db.Client.create({
    id: 1,
    clientName: 'First client',
    token: clientToken, //deprecated
    displayName: "First client for frontend",
  });

}
