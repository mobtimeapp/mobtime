import path from 'path';
import fs from 'fs';

import * as database from './connection';

const migratedPath = path.resolve(__dirname, 'migrated.json');
const migrationsPath = path.resolve(__dirname, 'migrations');
const migration = /\d+_.+\.js$/;

const getMigrated = () => {
  try {
    const json = fs.readFileSync(migratedPath, { encoding: 'utf8' });
    return JSON.parse(json);
  } catch (err) {
    return [];
  }
};

const getMigrations = () => {
  const migrations = fs.readdirSync(migrationsPath);
  return migrations.filter((m) => migration.test(m));
};

const pendingMigrations = () => {
  const all = getMigrations();
  const done = getMigrated();
  return all.filter((m) => !done.some((d) => d === m));
};

const markMigration = (file) => {
  const previous = getMigrated();
  fs.writeFileSync(migratedPath, JSON.stringify(previous.concat(file)), { encoding: 'utf8' });
};

const runMigrationUp = (db, files) => {
  if (files.length === 0) return Promise.resolve();

  const [file, ...rest] = files;
  const filePath = path.resolve(migrationsPath, file);

  process.stdout.write(`Running ${file} migration...`);

  const { up } = require(filePath); // eslint-disable-line import/no-dynamic-require, global-require
  return Promise.resolve(up(database))
    .then(() => markMigration(file))
    .then(() => console.log('done'))
    .then(() => runMigrationUp(db, rest));
};

console.log('DB', database.get());

console.log('All migrations', getMigrations());
console.log('already migrated', getMigrated());
console.log('pending migrations', pendingMigrations());
runMigrationUp(database.get(), pendingMigrations())
  .then(() => console.log('All migrations complete'))
  .catch((err) => console.warn('Unable to complete migrations', err))
  .finally(() => {
    process.exit(0);
  });

