
# An Express Image Server with Node.js: for uploading and resizing images
A simple express server that allows images to be uploaded with Multer and resizes the based on url scheme, resizing is done with the [node-steam](https://github.com/asilvas/node-image-steam#throttle-options) library.

Http-bearer is used fo validating requests so only registered clients can upload images.

## Prerequisites
 - [Git](https://git-scm.com/)
 - [Node.js and npm](https://nodejs.org/en/)
 - [ImageMagick](http://www.imagemagick.org/script/index.php)
 - [MySQL](https://www.mysql.com/)

## Installation
#### 1. Run npm install

```
npm i
```

#### 2. Configure .env

```
DB_NAME=
DB_USER=
DB_PASSWORD=
PORT_API=
PORT_IMAGE_SERVER=
IMAGES_DIR=
THROTTLE_CC_PROCESSORS=4
THROTTLE_CC_PREFETCHER= 20
THROTTLE_CC_REQUESTS= 100
APP_URL=
CACHE_TTS=
CACHE_OPTIMIZED_TTS=
CACHE_OPTIMIZED_TTS=
```
For throttle see options in [node-steam](https://github.com/asilvas/node-image-steam#throttle-options).

The app url is used to return a full url after upload.

Images directory defaults to images, if doesn't get created, create it manually.


#### 5. Init database
This will create a database and the first client
```npm run init```

#### 6. Run the server

Run npm (or pm2, or whatever runner you use).

```
npm run start
```


## Clients
For every site create a row in the MySQL clients table. Generate a random token that's safe. Currently there is no interface for creating so create it command line or through an mysql interface like sequelpro or phpmyadmin.

## Uploading an image
Example with node.js, using node-fetch & form-data. Notice dotenv is used for API values. Pass the access_token that you've generated for the client. (For security make sure it's over HTTPS)

```
const FormData = require('form-data');
const fetch = require('node-fetch');

exports.upload = function (token, buffer, fileName) {
  const form = new FormData();
  form.append('image', buffer, fileName);
  form.append('field', 'files');

  return fetch(process.env.IMAGE_API_URL+ '/image?access_token=' + process.env.IMAGE_API_ACCESS_TOKEN, {
    method: 'POST',
    body: form,
  })
  .then(function(res) {
    return res.json();
  })
  .then(function(json) {
    //json.url
  })
  .catch(function(err) {
    // handle error
  })
}
```

## Displaying & Resizing image

Example for creating a thumbnail resize and crop:

```
http://imageserver.com/image/path.png/:/rs=w:350,h:250;cp=w:350,h:250
```
For all options (resizing, cropping, filter, etc) check [node-steam](https://github.com/asilvas/node-image-steam).

## MySQL with SSL

When you want to connect to a MySQL server using SSL, a Certificate Authority certificate is required. The contents of this CA certificate can be passed into the `MYSQL_CA_CERT` environment variable.
