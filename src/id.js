import { effects } from 'ferp';

export const id = () =>
  Math.random()
    .toString(36)
    .slice(2);

export const GenerateIdEffect = action =>
  effects.thunk(() => {
    return effects.act(action(id()), action.name || 'GenerateIdEffect.Action');
  }, 'GenerateIdEffect');
