import * as effects from '../effects.js';

const arrayOrFunc = v => (Array.isArray(v) ? v : v());

export const reactions = {
  act: actFn => () => effects.Act(arrayOrFunc(actFn)),
  preventDefault: () => event => [
    function EventPreventDefaultFx() {
      event.preventDefault();
    },
    {},
  ],
  fx: effectRunner => () => arrayOrFunc(effectRunner),
};

export const withEvent = (reactionList = [reactions.preventDefault()]) => {
  return function ActionWithEvent(state, event) {
    return [state, ...reactionList.filter(r => r).map(r => r(event))];
  };
};
