const AWS = require('aws-sdk');

module.exports = {
  client: null,

  /**
   * @returns {boolean}
   */
  isEnabled: () => {
    return !!process.env.S3_ENDPOINT;
  },
  /**
   * @returns {S3|null}
   */
  getClient: function () {
    if (this.isEnabled() === false) {
      return null;
    }
    if (this.client) {
      return this.client;
    }
    const endpoint = new AWS.Endpoint(process.env.S3_ENDPOINT);
    this.client = new AWS.S3({
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET,
      endpoint: endpoint,
    });

    return this.client;
  },
  /**
   *
   * @param {string} path
   * @returns {Request<S3.GetObjectOutput, AWSError>}
   */
  getFile: function (path) {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: path,
    };

    return this.getClient().getObject(params);
  },
};
