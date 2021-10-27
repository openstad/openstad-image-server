const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./s3');
const md5 = require('md5');

/**
 *
 * @param file
 * @returns {string}
 */
function generateFileName(file) {
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
  return Date.now().toString() + ext;
}

const multerConfig = {
  onError: function (err, next) {
    next(err);
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
    ];

    if (allowedTypes.indexOf(file.mimetype) === -1) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }

    cb(null, true);
  },
  limits: {
    // 15 mb limit
    fileSize: 15 * 1024 * 1024, // Todo: make configurable
  },
};

if (s3.isEnabled()) {
  try {
    multerConfig.storage = multerS3({
      s3: s3.getClient(),
      bucket: process.env.S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },
      destination: function (req, file, cb) {
        cb(null, 'files/');
      },
      key: function (req, file, cb) {
        cb(null, generateFileName(file));
      },
    });
  } catch (error) {
    throw new Error(`S3 Multer storage error: ${error.message}`);
  }
} else {
  multerConfig.storage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, generateFileName(file));
    },
    destination: function (req, file, cb) {
      cb(null, 'files/');
    },
  });
}

module.exports = multer(multerConfig);
