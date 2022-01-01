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

 - Install NodeJS (>= v14.x, but older versions should work, too)
 - Install and run redis server
     - OSX+homebrew: `brew install redis`
     - Ubuntu: `sudo apt install redis-server`
     - Or google for your operating system's install instructions

```bash
yarn && yarn tailwind:dev && yarn start
```

### Environment Variables

| Name            | Description                      | Default Value      |
| --------------- | -------------------------------- | ------------------ |
| PORT            | Port number to run the server on | 4321               |


## Contributing

Bug reports and suggestions are welcome, just create an issue. PRs are welcome, too.

## License

It's under [MIT](./LICENSE.md).
