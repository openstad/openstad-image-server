require('dotenv').config();
const express = require('express');
const app = express();
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const db = require('./db');
const upload = require('./lib/multer');
const ImageServer = require('./lib/imageServer').getImageServer();

passport.use(new Strategy(
  function (token, done) {
    db.clients.findByToken(token, function (err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done(null, false);
      }
      return done(null, client, {scope: 'all'});
    });
  }
));

/**
 * Instantiate the Image steam server, and proxy it with
 */
const imageHandler = ImageServer.getHandler();

/**
 * Most errors is not found
 * @TODO: requires debugging if other errors are handled by server
 */
ImageServer.on('error', (err) => {
  // Don't log 404 errors, so we do nothing here.
});

app.get('/image/*',
  function (req, res, next) {
    req.url = req.url.replace('/image', '');

    /**
     * Pass request en response to the imageserver
     */
    imageHandler(req, res);
  });

/**
 *  The url for creating one Image
 */
app.post('/image',
  passport.authenticate('bearer', {session: false}),
  upload.single('image'), (req, res, next) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any
    //
    if (!res.headerSent) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.send(JSON.stringify({
      url: process.env.APP_URL + '/image/' + req.file.filename
    }));
  });

app.post('/images',
  passport.authenticate('bearer', {session: false}),
  upload.array('images', 30), (req, res, next) => {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    if (!res.headerSent) {
      res.setHeader('Content-Type', 'application/json');
    }

    res.send(JSON.stringify(req.files.map((file) => {
      return {
        url: process.env.APP_URL + '/image/' + req.file.filename
      }
    })));
  });

app.use(function (err, req, res, next) {
  const status = err.status ? err.status : 500;
  //console.log('err', err);
  if (!res.headerSent) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.status(status).send(JSON.stringify({
    error: err.message
  }));
})

module.exports = app;
