import path from 'path';
import fs from 'fs';

const probablyJsFile = /\d{4,}_.+\.js$/;

export const getMigrations = async () => {
  const getFileSortThingTaco = (file) => Number(file.split('_')[0]);

  const migrationsPath = path.resolve(__dirname, '..', 'migrations');
  const files = await fs.promises.readdir(migrationsPath);

  return files
    .filter((f) => probablyJsFile.test(f))
    .sort((a, b) => getFileSortThingTaco(a) - getFileSortThingTaco(b))
    .map((f) => (
      require( // eslint-disable-line global-require, import/no-dynamic-require
        path.resolve(migrationsPath, f),
      ).default
    ));
};

export const runMigrations = (migrations, timer) => migrations
  .reduce((nextTimer, migrationFn) => (
    migrationFn(nextTimer)
  ), timer);

export const migrateTimers = async (state) => {
  const migrations = await getMigrations();
  return Object.keys(state).reduce((nextState, timerKey) => ({
    ...nextState,
    [timerKey]: runMigrations(migrations, state[timerKey]),
  }), {});
};
