const ngrok = require('ngrok');

ngrok.connect({
  proto: 'http',
  port: 4321,
})
  .then((url) => {
    console.log('>>> ngrok tunnel: ', url);
    console.log('                : ', url.replace(/^https/, 'http'));
  });
