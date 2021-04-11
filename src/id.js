import { effects } from 'ferp';
import { memoize } from './memoize.js';

export const id = () =>
  Math.random()
    .toString(36)
    .slice(2);

export const GenerateIdEffect = memoize(
  action =>
    effects.thunk(() => {
      return effects.act(action, id());
    }),
  1,
);
