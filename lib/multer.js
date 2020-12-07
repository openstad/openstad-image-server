const multer = require('multer');

module.exports = multer({
  dest: 'images/',
  onError: function (err, next) {
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
