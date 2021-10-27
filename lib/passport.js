const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const db = require('../db');

passport.use(
  new Strategy(function (token, done) {
    db.clients.findByToken(token, function (err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      return done(null, client, { scope: 'all' });
    });
  })
);

module.exports = passport;
