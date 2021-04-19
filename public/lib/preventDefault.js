export const preventDefault = fn => {
  return (state, event) => {
    event.preventDefault();
    const [action, props] = fn(event);
    return action(state, props);
  };
};

export const withDefault = fn => {
  return (state, event) => {
    console.log('withDefault', { state, event });
    const [action, props] = fn(event);
    return action(state, props);
  };
};
