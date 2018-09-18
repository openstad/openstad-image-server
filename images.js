exports.handleDisplayingImage = (request, response, basePath) => {
    // local variables
    const param1 = request.params.param1;
    const param2 = request.params.param2;
    let width = request.params.x;
    let height = request.params.y;
    const fit = request.query.fit;
    const force = request.query.force;

    // limit max width and height
    if (width > argv.xmax) //max width
      width = argv.xmax;
    if (height > argv.ymax) //max height
      height = argv.ymax;

    const ext = param2
      .split('.')
      .pop();

    const completePath = basePath + param1 + '/' + param2;
    const url = encodeURI(request.url);

    // search in Redis if the url requested is cached
    if (redisConnection) {
      client
        .get(url, function (err, value) {
          if (!err) {
            response.set('Content-type', mime[ext.toLowerCase]);

            if (value === null) { // image not cached
              checkImageProcess();
            } else {
              response.send(value);
            }
          } else {
            console.error('ERROR reading from redis', err);
            response.statusCode = 500;
            response.end();
          }
        });
    } else {
      // if no Redis connection, just serve the image
      checkImageProcess();
    }

    function checkImageProcess() {
      // if the image is being processed, the server block it until process[url]
      // doesnt exist With the use of promises, we ensure the image is not being
      // processed more than one at a time
      if (process[url]) {
        process[url].then((img) => {
          response.end(img);
        }, (reason) => {
          console.error('ERROR. Waiting a traitment', reason);
          response.statusCode = 500;
          response.end();
        });
      } else {
        process[url] = cache(url, response, completePath, width, height, ext, fit, force);
        process[url].catch((reason) => {
          console.error(reason);
        })
          .then(function () {
            delete process[url];
          });
      }
    }
}

function showImage(url, response, completePath, width, height, ext, fit, force) {
  return new Promise((resolve, reject) => {
    let widthResize = width;
    let heightResize = height;
    response.writeHead(200, {'Content-Type': mime[ext]});

    const image = gm(completePath); //create resized image
    image.size(function (err, size) {
      if (!err) {
        const originalRatio = size.width / size.height;
        const newRatio = width / height;
        let isSmaller = false;

        // if original image is lower than the requested one, it can be extended
        if (size.width < width && size.height < height) {
          isSmaller = true;
        }

        if (fit === 'true') {
          if (originalRatio > newRatio) { // limita the height
            widthResize = null;
          } else { // limit the width
            heightResize = null;
          }

          if (!isSmaller) {
            // if the parameter of the gm.resize() is null, it resize keeping the aspect
            // ratio
            image.resize(widthResize, heightResize);
          } else if (force === 'true' && isSmaller) {
            image.resize(widthResize, heightResize);
          }

          image
            .gravity('Center')
            .crop(width, height);
        } else {
          // the original image only can be extended if force is true
          if (!isSmaller) {
            image.resize(width, height);
          } else if (force === 'true' && isSmaller) {
            image.resize(width, height);
          }
        }

      } else {
        reject(err);
        response.statusCode = 500;
        response.end();

        return;
      }

      image.noProfile();
      image.stream(function (error, stdout) {
        if (error) {
          reject('ERROR 1' + error);
          response.statusCode = 500;
          response.end();
          return;
        }

        try {
          stdout.pipe(response);

        } catch (e) {
          reject('ERROR 2' + e);
          response.statusCode = 500;
          response.end();
          return;
        }

        let buf = new Buffer('');
        stdout.on('data', function (chunk) {
          buf = Buffer.concat([buf, chunk]);
        });
        stdout.on('end', function () {
          if (redisConnection) {
            client.setex(url, argv.redisTTL, buf);
          }
          resolve(buf);
        });
        stdout.on('error', function (error) {
          reject('ERROR 3' + error);
          stdout.end();
          response.statusCode = 500;
          response.end();

          stdout.end();
        });

      });
    });
  });
}

function cache(url, response, completePath, width, height, ext, fit, force) {
  return new Promise((resolve, reject) => {
    // check if the path is a file system or a uri
    if (completePath.indexOf('http://') > -1) {
      http
        .get(completePath, function () {
          showImage(url, response, completePath, width, height, ext, fit, force).then(resolve, reject);
        })
        .on('error', function (e) {
          response.end();
          reject(e.message);
        });
    } else {
      fs
        .readFile(completePath, function (error) {
          if (!error) {
            showImage(url, response, completePath, width, height, ext, fit, force).then(resolve, reject);
          } else {
            response.statusCode = 404;
            response.end();
            reject('ERROR obtaining image ' + completePath + '\n');
          }
        });
    }
  });
}
