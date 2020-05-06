import process from 'process';
import path from 'path';
import fs from 'fs';

const storageTmpPath = path.resolve(__dirname, '..', 'storage', 'tmp');

const removeTokens = (state) => Object.keys(state).reduce((nextState, timerId) => ({
  ...nextState,
  [timerId]: {
    ...state[timerId],
    tokens: [],
  },
}), {});

const PersistenceSubscription = (storage) => () => {
  const serializeState = () => {
    const state = removeTokens(storage.read());

    fs.writeFileSync(
      path.resolve(storageTmpPath, 'state.json'),
      JSON.stringify(state),
      { encoding: 'utf8' },
    );
  };

  const listenTo = (signal) => {
    process.on(signal, serializeState);
    return () => process.off(signal, serializeState);
  };

  const cancels = [
    listenTo('beforeExit'),
    listenTo('SIGINT'),
  ];

  return () => {
    for (const fn of cancels) {
      fn();
    }
  };
};

export const Persist = (...props) => [PersistenceSubscription, ...props];
