const ngrok = require('ngrok');
const { config } = require('dotenv');

config();

const port = process.env.PORT || 4321;

ngrok.connect({
  proto: 'http',
  port,
})
  .then((url) => {
    console.log('>>> Share this link: ', url); // eslint-disable-line no-console
  });
