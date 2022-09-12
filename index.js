require('dotenv/config');
j = require = require('esm')(module /*, options*/);
if (process.env.WORKERS > 1 || process.env.WORKERS === -1) {
  module.exports = require('./src/web/index.cluster.js');
} else {
  module.exports = require('./src/web/index.js');
}
