import { effects } from 'ferp/src/ferp';
import fetch from 'node-fetch';
import semver from 'semver';
import packageJson from '../package.json';

  const repository = packageJson.repository.url;
  const version = semver.coerce(packageJson.version);

  const [owner, repo] = repository
    .replace(/^https:\/\/github.com\//, '')
    .replace(/\.git$/, '')
    .split('/');

export const CheckVersion = () => effects.defer(
  fetch(`https://api.github.com/repos/${owner}/${repo}/tags`)
    .then(r => {
      if (!r.ok) {
        const error = new Error(`Status ${r.status}: ${r.statusText}`);
        error.response = r;
        throw error;
      }
      return r.json();
    })
    .then(([latestTag]) => {
      const latestTagVersion = semver.coerce(latestTag.name);
      if (semver.gt(latestTagVersion, version)) {
        console.log('!!! There is a new timer version available, update with git pull !!!');
      } else {
        console.log('You are using the latest version of mobtime!');
      }
    })
    .catch((err) => {
      console.log('Unable to determine if there is a newer version');
      console.log(err);
      console.log('But the server will continue to function');
    })
    .then(() => effects.none())
);
