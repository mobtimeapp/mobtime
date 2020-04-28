import { effects } from 'ferp';
import path from 'path';
import fs from 'fs';

const storageTmpPath = path.resolve(__dirname, '..', 'storage', 'tmp');

export const LoadEffect = (Actions) => effects.defer(
  fs.promises.readFile(
    path.resolve(storageTmpPath, 'state.json'),
    { encoding: 'utf8' },
  )
    .then(JSON.parse)
    .then(Actions.Load)
    .catch((err) => {
      console.log('Unable to read previous state');
      console.log(err);
      console.log('');
      return effects.none();
    }),
);
