const hat = require('hat');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('clients').del()
    .then(function () {
      const rack = hat.rack();
      const clientToken = process.env.FIRST_IMAGE_API_ACCESS_TOKEN ? process.env.FIRST_IMAGE_API_ACCESS_TOKEN : rack();
      console.log('---->> seeds', clientToken);


      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        clientName: 'First client',
        token: clientToken, //deprecated
        displayName: "First client for frontend",
      },
    ]);
  });

};
//
