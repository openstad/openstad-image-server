require('dotenv').config();
const express = require('express');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const AWS = require('aws-sdk')
const multerS3 = require('multer-s3')
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const db = require('./db');

const multerConfig = {
  onError: function (err, next) {
    console.error(err);
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
}

const imageSteamConfig = {
  "storage": {
    "defaults": {
      "driver": "fs",
      "path": "./images",
      "cacheTTS": process.env.CACHE_TTS || 86400 * 14, /* 24 * 14 hrs */
      "cacheOptimizedTTS": process.env.CACHE_OPTIMIZED_TTS || 86400 * 14, /*  24 * 14 hrs */
      "cacheArtifacts": process.env.CACHE_ARTIFACTS || true
    },
  },
  "throttle": {
    "ccProcessors": process.env.THROTTLE_CC_PROCESSORS || 4,
    "ccPrefetchers": process.env.THROTTLE_CC_PREFETCHER || 20,
    "ccRequests": process.env.THROTTLE_CC_REQUESTS || 100
  },
  log: {
    errors: true
  }
};

if (process.env.S3_ENDPOINT) {
  try {
    const endpoint = new AWS.Endpoint(process.env.S3_ENDPOINT);
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET,
      endpoint: endpoint
    });

    multerConfig.storage = multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname
        });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    });
  } catch(error) {
    console.error(error);
  }
  imageSteamConfig.storage.defaults = {
      "driverPath": "image-steam-s3",
      "endpoint": process.env.S3_ENDPOINT,
      "bucket": process.env.S3_BUCKET,
      "accessKey": process.env.S3_KEY,
      "secretKey": process.env.S3_SECRET
  };
} else {
  multerConfig.dest = 'images/';
}

const upload = multer(multerConfig);

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
      default: process.env.PORT_IMAGE_SERVER || 13337
    },
  })
  .help()
  .argv;

passport.use(new Strategy(
  function (token, done) {
    db.Client
      .findOne({ where: { token } })
      .then(client => {
        if (!client) {
          return done(null, false);
        }
        return done(null, client, {scope: 'all'});
      })
      .catch(err => {
        return done(err);
      })
  }
));

/**
 * Instantiate the Image steam server, and proxy it with
 */
const ImageServer = new imgSteam.http.Connect(imageSteamConfig);
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

    const fileName = req.file.filename || req.file.key;
    res.send(JSON.stringify({
      url: process.env.APP_URL + '/image/' + fileName
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

    const fileName = req.file.filename || req.file.key;
    res.send(JSON.stringify(req.files.map((file) => {
      return {
        url: process.env.APP_URL + '/image/' + fileName
      }
    })));
  });

app.use(function (err, req, res, next) {
  const status = err.status ? err.status : 500;
  console.error(err);
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
