export const preventDefault = fn => {
  return (state, event) => {
    event.preventDefault();
    const [action, props] = fn(event);
    return action(state, props);
  };
};
