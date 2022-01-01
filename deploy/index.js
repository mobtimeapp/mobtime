const child_process = require('child_process');
const path = require('path');

const { appName, targets } = require('./config');

const deployScript = path.resolve(__dirname, 'work.sh');

const exec = (cmd, args = [], prefix = 'CMD') => new Promise((resolve, reject) => {
  const command = `${cmd} ${args.join(' ')}`;
  console.log(`Running \`${command}\`...`);

  const proc = child_process.spawn(cmd, args, {
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: true,
  });

  const formatMessage = (from, data) => {
    const message = data.toString().trim();
    if (!message) {
      return [];
    }

    return message
      .split(/(\r|\n)+/)
      .map(line => line.trim())
      .filter(line => !!line)
      .map(line => `[${prefix}|${from}] ${line}`);
  };

  proc.stdout.on('data', (data) => {
    formatMessage('stdout', data).forEach((line) => process.stdout.write(`${line}\n`));
  });

  proc.stderr.on('data', (data) => {
    formatMessage('stderr', data).forEach((line) => process.stderr.write(`${line}\n`));
  });

  proc.on('close', (code) => {
    return code === 0 ? resolve() : reject (code);
  });
});

const main = async (env) => {
  const target = targets[env.TARGET];

  if (!target) {
    const available = Object.keys(targets);
    console.error(`Unable to deploy to ${process.env.TARGET}, must be one of ${available.join(', ')}.`);
    console.log("To fix this, try:\nTARGET=<target> yarn deploy");
    return 1;
  };

  const now = Date.now();
  const remotePath = `/tmp/deploy_${appName}_${now}.sh`;

  const sshTarget = `${target.ssh.user}@${target.ssh.host}`;

  console.log('Starting deploy');
  console.log('=======================');
  console.log(JSON.stringify(target, null, 2));
  console.log('=======================');

  console.log('Initializing deploy script...');
  await exec('scp', [
    ...(target.rsa ? [`-i ${target.rsa}`] : []),
    deployScript,
    `${sshTarget}:${remotePath}`,
  ], `scp ${sshTarget}`);
  console.log('Initializing deploy script...done');

  console.log('');

  console.log(`Deploying to ${target.ssh.host}...`);
  await exec('ssh', [
    ...(target.rsa ? [`-i ${target.rsa}`] : []),
    sshTarget,
    ...Object.keys(target.env || {}).reduce((envs, key) => [
      ...envs,
      `${key}=${target.env[key]}`,
    ], []),
    'bash',
    remotePath,
  ], `ssh ${sshTarget}`);
  console.log(`Deploying to ${target.ssh.host}...done`);

  return 0;
};

main(process.env)
  .catch((err) => {
    console.error(err);
    return 1;
  })
  .then(process.exit);
