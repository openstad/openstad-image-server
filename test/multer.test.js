describe('Test multer config', () => {

  it('Should throw exception when bucket is missing', async () => {
    process.env = {};
    process.env.S3_ENDPOINT = 'test';
    expect(() => {
      require('../lib/multer');
    }).toThrow();
  });

  it('Should use aws', async () => {
    process.env = {};
    process.env.S3_ENDPOINT = 'test';
    process.env.S3_BUCKET = 'bla';
    const multer = require('../lib/multer');

    console.log(multer.storage);
  });
});


