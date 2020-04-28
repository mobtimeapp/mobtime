import process from 'process';
import path from 'path';
import fs from 'fs';

const storageTmpPath = path.resolve(__dirname, '..', 'storage', 'tmp');

const PersistenceSubscription = (storage) => () => {
  const serializeState = (source) => () => {
    const state = storage.read();
    console.log(source, 'persisting state', state); 
    fs.writeFileSync(
      path.resolve(storageTmpPath, 'state.json'),
      JSON.stringify(state),
      { encoding: 'utf8' },
    );
  };

  const listenTo = (signal) => {
    const fn = serializeState(`[${signal}]`);
    process.on(signal, fn);
    return () => process.off(signal, fn);
  };

  const cancels = [
    listenTo('beforeExit'),
    listenTo('SIGINT'),
  ];

  console.log('Waiting on exit signals...');

  return () => {
    console.log('Removing persistence subscription');
    for (const fn of cancels) {
      fn();
    }
  };
};

export const Persist = (...props) => [PersistenceSubscription, ...props];
