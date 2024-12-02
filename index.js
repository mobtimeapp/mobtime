import 'dotenv/config';

if (process.env.WORKERS > 1 || process.env.WORKERS === -1) {
  import('./src/web/index.cluster.js');
} else {
  import('./src/web/index.js');
  //module.exports = require('./src/web/index.js');
}
