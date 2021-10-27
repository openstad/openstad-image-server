require('dotenv').config();
module.exports.getImageServer = () => {
  console.log('getImageServer method');
  const imgSteam = require('image-steam');

  const imageSteamConfig = {
    "storage": {
      "defaults": {
        "driver": "fs",
        "path": "./images",
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

  /**
   * Instantiate the Image steam server, and proxy it with
   */
  return new imgSteam.http.Connect(imageSteamConfig);
};
