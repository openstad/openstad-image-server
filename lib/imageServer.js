require('dotenv').config();
const s3 = require('./s3');

module.exports.getImageServer = () => {
  const imgSteam = require('image-steam');

  const imageSteamConfig = {
    "storage": {
      "defaults": {
        "driver": "fs",
        "path": "./files",
      },
      "cacheTTS": process.env.CACHE_TTS || 86400 * 14, /* 24 * 14 hrs */
      "cacheOptimizedTTS": process.env.CACHE_OPTIMIZED_TTS || 86400 * 14, /*  24 * 14 hrs */
      "cacheArtifacts": process.env.CACHE_ARTIFACTS || true
    },
    "throttle": {
      "ccProcessors": process.env.THROTTLE_CC_PROCESSORS || 4,
      "ccPrefetchers": process.env.THROTTLE_CC_PREFETCHER || 20,
      "ccRequests": process.env.THROTTLE_CC_REQUESTS || 100
    },
    log: {
      errors: false
    }
  };

  if (s3.isEnabled()) {
    imageSteamConfig.storage.defaults = {
      "driverPath": "image-steam-s3",
      "endpoint": process.env.S3_ENDPOINT,
      "bucket": process.env.S3_BUCKET,
      "accessKey": process.env.S3_KEY,
      "secretKey": process.env.S3_SECRET
    };
  }

  /**
   * Instantiate the Image steam server, and proxy it with
   */
  return new imgSteam.http.Connect(imageSteamConfig);
};
