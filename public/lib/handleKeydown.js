export const handleKeydown = (acceptance, keyActionMap) => (state, event) => {
  if (!acceptance(event)) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
    return state;
  }
  const action = keyActionMap[event.key];
  if (!action) {
    return state;
  }
  event.preventDefault();
  return action(state, event);
};
