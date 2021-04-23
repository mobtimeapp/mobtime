export const preventDefault = fn => {
  return (state, event) => {
    event.preventDefault();
    const output = fn(event);
    return Array.isArray(output) ? output[0](state, output[1]) : output(state);
  };
};

export const withDefault = fn => {
  return (state, event) => {
    const [action, props] = fn(event);
    return action(state, props);
  };
};
