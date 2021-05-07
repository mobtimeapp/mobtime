import * as effects from '../effects.js';

export const reactions = {
  act: actFn => () => effects.Act(actFn()),
  preventDefault: () => event => [
    function EventPreventDefaultFx() {
      event.preventDefault();
    },
    {},
  ],
  fx: effectRunner => () => effectRunner,
};

export const withEvent = (reactionList = [reactions.preventDefault()]) => {
  return function ActionWithEvent(state, event) {
    return [state, ...reactionList.filter(r => r).map(r => r(event))];
  };
};
