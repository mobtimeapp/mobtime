# mobtime

A websocket powered, collaborative mobbing timer.

On your desktop:

<p align="center">
  <img src="./docs/screenshot.png" width="30%" height="auto" />
</p>

And your phone:

<p align="center">
  <img src="./docs/screenshot-mobile.png" width="30%" height="auto" />
</p>

## Get up and running

```bash
yarn && yarn start
```

### Environment Variables

| Name            | Description                      | Default Value      |
| --------------- | -------------------------------- | ------------------ |
| PORT            | Port number to run the server on | 4321               |

### Sharing from your local computer

#### Using ngrok

```bash
yarn global add ngrok

ngrok http 4321 # replace 4321 with the port you do
```

### Host it with pm2 and nginx

nginx

```
{
  location / {
    proxy_pass                  http://localhost:4321;
    proxy_redirect              off;
    proxy_set_header            Host $host;
    proxy_set_header            X-Real-IP $remote_addr;
    proxy_set_header            X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header            X-Forwarded-Host $server_name;

    proxy_pass_request_headers  on;

    proxy_set_header            Upgrade $http_upgrade;
    proxy_set_header            Connection "upgrade";
  }
}
```

pm2 `ecosystem.config.js`

```js
module.exports = {
  apps : [{
    name: 'mobtime',
    script: 'index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 4321,
    },
  }],
};
```


## Contributing

Bug reports and suggestions are welcome, just create an issue. PRs are welcome, too.

## License

It's under [MIT](./LICENSE.md).
