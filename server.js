require('dotenv').config();
const fs = require('fs');
const http = require('http');
const express = require('express');
const errorHandler  = require('express-json-errors');
const jsonErrorHandler = require('express-json-error-handler').default;
const proxy = require('http-proxy-middleware');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const db = require('./db');
//const imageSteamConfig = require('./config/image-steam');
const upload = multer({
    dest: 'images/',
    onError : function(err, next) {
      console.log('--> error', err);
      next(err);
    }
});

const imageSteamConfig = {
  "storage": {
     "defaults": {
       "driver": "fs",
       "path": "./images",
     },
  },
  "throttle": {
      "ccProcessors": 4,
      "ccPrefetchers": 20,
      "ccRequests": 100
  },
  log : {
    errors: false
  }
}

const argv = require('yargs')
  .usage('Usage: $0 [options] pathToImage')
  .demand(0)
  .options({
    'port': {
      alias: 'p',
      describe: 'Port number the service will listen to',
      type: 'number',
      group: 'Image service',
      default: 9999
    },
    'portImageSteam': {
      alias: 'pis',
      describe: 'Port number the Image server will listen to',
      type: 'number',
      group: 'Image service',
      default: 13337
    },
  })
  .help()
  .argv;

passport.use(new Strategy(
  function(token, done) {
    db.clients.findByToken(token, function (err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      return done(null, client, { scope: 'all' });
    });
  }
));

/**
 * Instantiate the Image server
 */
const ImageServer = new  imgSteam.http.Connect(imageSteamConfig);
const imageHandler = ImageServer.getHandler();

app.get('/image/*',
  function(req, res, next) {
    req.url = req.url.replace('/image', '');
    imageHandler(req, res);

    ImageServer.on('error', (err) => {
      err.status = 404;
      err.msg = 'Not found';

      next(err);
    });
});

// http://localhost:9999/image/rijksmuseum.jpg/:/rs=w:400,h:600,m/cr=w:400,h:600

app.post('/image',
  passport.authenticate('bearer', { session: false }),
  upload.single('image'), (req, res, next) => {
    console.log('-------->');
    console.log('req.file', req.file);

  // req.file is the `image` file
  // req.body will hold the text fields, if there were any
  res.setHeader('Content-Type', 'application/json');

  res.send(JSON.stringify({
    url: process.env.APP_URL + '/image/' + req.file.filename
  }));
});

app.post('/images',
  passport.authenticate('bearer', { session: false }),
  upload.array('images', 30), (req, res, next) => {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(req.files.map((file) => {
    return {
      url:process.env.APP_URL + '/image/' + req.file.filename
    }
  })));
});

app.use(function (err, req, res, next) {
  const status = err.status ?  err.status : 500;
  console.log('err', err);
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify({
    error: err.msg
  }));
})

app.listen(argv.port, function () {
  console.log('Application listen on port %d...', argv.port);
});
