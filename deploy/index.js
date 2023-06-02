import * as child_process from 'child_process';
import * as path from 'path';
import * as process from 'process';
import { homedir } from 'os';
import { readFileSync, createReadStream } from 'fs';

import passwordPrompt from 'password-prompt';

import { Client } from 'ssh2';
import sshconfStream from 'sshconf-stream';

import { appName, targets } from './config.js';

const deployScript = path.resolve(process.cwd(), 'deploy', 'work.sh');

const readSshConf = (sshConfPath) => {
  return new Promise((resolve, reject) => {
    let sshConfig = {};
    createReadStream(sshConfPath || path.join(homedir(), '.ssh/config'), 'utf8')
      .pipe(sshconfStream.createParseStream())
      .on('data', (host) => {
        const data = host.keywords;
        const attrs =  {
          host: data.HostName[0],
          username: data.User[0],
          privateKey: data.IdentityFile[0],
          forwardAgent: data.ForwardAgent[0] === 'yes',
        };
        const key = data.Host[0];
        sshConfig[key] = attrs;
      })
      .on('end', () => {
        return resolve(sshConfig);
      })
  });
}

const getTarget = () => {
  return new Promise((resolve, reject) => {
    const target = process.env.TARGET;
    return target && (target in targets)
      ? resolve(targets[target])
      : reject(`${target || 'undefined'} is not a valid deploy target`);
      
  });
};

const promptPassphrase = (target) => {
  return target.ssh.passphrase === true
    ? passwordPrompt('Identity file passphrase: ', { method: 'hide' })
    : Promise.resolve(undefined);
};

const prepareDeploy = ([sshConfig, target]) => {
  console.log('prepareDeploy', { sshConfig, target });
  const ssh = target.ssh.host && (target.ssh.host in sshConfig)
    ? sshConfig[target.ssh.host]
    : target.ssh;

  return promptPassphrase(target)
    .then((passphrase) => ({
      ssh: {
        ...ssh,
        privateKey: readFileSync(ssh.privateKey),
        passphrase,
      },
      env: target.env,
    }));
};

const deploy = (script) => ({ ssh, env }) => {
  const client = new Client();
  const exec = (command) => new Promise((resolve, reject) => {
    const cmd = Object.keys(env)
      .reduce((memo, envKey) => {
        return memo.replaceAll(`$${envKey}`, env[envKey]);
      }, command);

    client.exec(cmd, { pty: true }, (err, stream) => {
      if (err) {
        stream.pipe(process.stderr);
        stream.on('finish', () => {
          reject(err);
        });
        return;
      }
      stream.pipe(process.stdout);
      stream.on('finish', () => {
        resolve();
      });
    })
  });

  return new Promise((resolve, reject) => {
    client 
      .on('ready', () => {
        console.log('ssh ready');
        script
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .filter(line => !line.startsWith('#'))
          .reduce((promise, line) => {
            return promise.then(() => exec(line));
          }, Promise.resolve())
          .then(() => resolve(0));
      })
      .on('error', (err) => {
        console.error('ssh failed');
        reject(err);
      })
      .connect({ ...ssh, agentForward: false, tryKeyboard: true });
  })
    .finally(() => client.end());
};

Promise.all([
  readSshConf(),
  getTarget(),
])
  .then(prepareDeploy)
  .then(deploy(readFileSync(deployScript).toString()))
  .catch((err) => {
    console.error(err);
    return 1;
  })
  .then((code) => process.exit(code));



// main(process.env)
//   .catch(err => {
//     console.error(err);
//     return 1;
//   })
//   .then(process.exit);
