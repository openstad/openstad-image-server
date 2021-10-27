require('dotenv').config();
const app = require('./app');

const argv = require('yargs')
  .usage('Usage: $0 [options] pathToImage')
  .demand(0)
  .options({
    port: {
      alias: 'p',
      describe: 'Port number the service will listen to',
      type: 'number',
      group: 'Image service',
      default: process.env.PORT_API || 9999,
    },
    portImageSteam: {
      alias: 'pis',
      describe: 'Port number the Image server will listen to',
      type: 'number',
      group: 'Image service',
      default: process.env.PORT_IMAGE_SERVER || 13337,
    },
  })
  .help().argv;

app.listen(argv.port, function () {
  console.log('Application listen on port %d...', argv.port);
});
