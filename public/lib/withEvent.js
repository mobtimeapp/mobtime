import * as effects from '../effects.js';

const arrayOrFunc = (v, event) => (Array.isArray(v) ? v : v(event));

export const reactions = {
  act: actFn => event => effects.Act(arrayOrFunc(actFn, event)),
  preventDefault: () => event => [
    function EventPreventDefaultFx() {
      event.preventDefault();
    },
    {},
  ],
  fx: effectRunner => () => arrayOrFunc(effectRunner),
  inlineFx: callback => event => [
    (dispatch, e) => {
      const value = callback(e);
      return Array.isArray(value) ? dispatch(...value) : null;
    },
    event,
  ],
};

export const withEvent = (reactionList = [reactions.preventDefault()]) => {
  return function ActionWithEvent(state, event) {
    return [state, ...reactionList.filter(r => r).map(r => r(event))];
  };
};
