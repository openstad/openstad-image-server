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
      next(err);
    },
    fileFilter: function (req, file, cb) {
      const allowedTypes = [
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/svg+xml'
      ];

     if (allowedTypes.indexOf(file.mimetype) === -1) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
     }

     cb(null, true);
   }
});

const imageSteamConfig = {
  "storage": {
     "defaults": {
       "driver": "fs",
       "path": "./images",
     },
     "cacheTTS": 86400 * 14, /* 24 * 14 hrs */
     "cacheOptimizedTTS": 86400 * 14, /*  24 * 14 hrs */
  },
  "throttle": {
    "ccProcessors": 4,
    "ccPrefetchers": 20,
    "ccRequests": 100
  },
  log : {
    errors: false
  }
};

if (process.env.THROTTLE) {
  imageSteamConfig.throttle =  {
      "ccProcessors": process.env.THROTTLE_CC_PROCESSORS,
      "ccPrefetchers": process.env.THROTTLE_CC_PREFETCHER,
      "ccRequests": process.env.THROTTLE_CC_REQUESTS
  };
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
      default: process.env.PORT_API || 9999
    },
    'portImageSteam': {
      alias: 'pis',
      describe: 'Port number the Image server will listen to',
      type: 'number',
      group: 'Image service',
      default: process.env.PORT_IMAGE_SERVER ||  13337
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
 * Instantiate the Image steam server, and proxy it with
 */
const ImageServer = new  imgSteam.http.Connect(imageSteamConfig);
const imageHandler = ImageServer.getHandler();

/**
 * Most errors is not found
 * @TODO: requires debugging if other errors are handled by server
 */
ImageServer.on('error', (err) => {
  // Don't log 404 errors, so we do nothing here.
});

app.get('/image/*',
  function(req, res, next) {
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
  passport.authenticate('bearer', { session: false }),
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
  passport.authenticate('bearer', { session: false }),
  upload.array('images', 30), (req, res, next) => {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  if (!res.headerSent) {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(JSON.stringify(req.files.map((file) => {
    return {
      url:process.env.APP_URL + '/image/' + req.file.filename
    }
  })));
});

app.use(function (err, req, res, next) {
  const status = err.status ?  err.status : 500;
  //console.log('err', err);
  if (!res.headerSent) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.status(status).send(JSON.stringify({
    error: err.message
  }));
})

app.listen(argv.port, function () {
  console.log('Application listen on port %d...', argv.port);
  //console.log('Image  server listening on port %d...', argv.portImageSteam);
});
