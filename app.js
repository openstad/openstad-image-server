require('dotenv').config();
const express = require('express');
const app = express();
const passport = require('./lib/passport');
const upload = require('./lib/multer');
const ImageServer = require('./lib/imageServer').getImageServer();
const s3 = require('./lib/s3');
const fs = require('fs');
const mime = require('mime-types');

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

function sendJsonHeaders(res) {
  if (!res.headerSent) {
    res.setHeader('Content-Type', 'application/json');
  }
}

// Global middleware to catch errors
app.use(function (err, req, res, next) {
  const status = err.status ? err.status : 500;
  if (status > 500) {
    console.error(err);
  }

  sendJsonHeaders(res);
  res.status(status).send(
    JSON.stringify({
      error: err.message,
    })
  );
});

app.get('/image/*', function (req, res, next) {
  req.url = req.url.replace('/image', '');

  /**
   * Pass request en response to the image server
   */
  imageHandler(req, res);
});

/**
 *  The url for creating one Image
 */
app.post(
  '/image',
  passport.authenticate('bearer', { session: false }),
  upload.single('image'),
  (req, res, next) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any
    //
    sendJsonHeaders(res);
    const filename = req.file.key || req.file.filename;
    res.send(
      JSON.stringify({
        url: process.env.APP_URL + '/image/' + filename,
      })
    );
  }
);

app.post(
  '/images',
  passport.authenticate('bearer', { session: false }),
  upload.array('images', 30),
  (req, res, next) => {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
    sendJsonHeaders(res);

    res.send(
      JSON.stringify(
        req.files.map((file) => {
          const filename = file.key || file.filename;
          return {
            url: process.env.APP_URL + '/image/' + filename,
          };
        })
      )
    );
  }
);

app.post(
  '/file',
  passport.authenticate('bearer', { session: false }),
  upload.single('file'),
  (req, res, next) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any
    //
    sendJsonHeaders(res);

    const filename = req.file.key || req.file.filename;
    res.send(
      JSON.stringify({
        url: process.env.APP_URL + '/files/' + filename,
      })
    );
  }
);

function handleFileResponse(filePath, readStream, res) {
  // Content-type is very interesting part that guarantee that
  // Web browser will handle response in an appropriate manner.

  // Get filename
  const filename = filePath.substring(filePath.lastIndexOf('/') + 1);
  const mimeType = mime.lookup(filename);

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Disposition': 'attachment; filename=' + filename,
  });

  readStream.pipe(res);
}

app.get('/files/*', async function (req, res, next) {
  const filePath = decodeURI(req.url.replace(/^\/+/, '').replace('files/', ''));

  if (s3.isEnabled()) {
    const readStream = s3.getFile(filePath).createReadStream();
    return handleFileResponse(filePath, readStream, res);
  }

  // Check if file specified by the filePath exists
  fs.exists(filePath, function (exists) {
    if (exists) {
      const readStream = fs.createReadStream(filePath);
      handleFileResponse(filePath, readStream, res);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('ERROR File does not exist');
    }
  });
});

module.exports = app;
