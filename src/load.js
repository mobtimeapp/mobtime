import { effects } from 'ferp';
import path from 'path';
import fs from 'fs';

import { migrateTimers } from './lib/migrations';

const storageTmpPath = path.resolve(__dirname, '..', 'storage', 'tmp', 'state.json');
export const LoadEffect = (Actions) => effects.defer(
  fs.promises.readFile(
    storageTmpPath,
    { encoding: 'utf8' },
  )
    .then(JSON.parse)
    .then(migrateTimers)
    .then((state) => (
      fs.promises.unlink(storageTmpPath)
        .then(() => Actions.Load(state))
    ))
    .catch((err) => {
      console.log('Unable to read previous state');
      console.log(err);
      console.log('');
      return effects.none();
    }),
);
