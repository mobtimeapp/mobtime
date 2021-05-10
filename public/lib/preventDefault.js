import * as effects from '../effects.js';

export const preventDefault = fn => {
  return function PreventDefaultEventHandlerAction(state, event) {
    event.preventDefault();
    return [state, effects.Act(fn(event))];
  };
};

export const withDefault = fn => {
  return function DefaultEventHandlerAction(state, event) {
    return [state, effects.Act(fn(event))];
  };
};
