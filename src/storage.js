export const make = () => {
  let state = {};

  const store = (data) => {
    state = { ...data };
  };

  const read = () => state;

  return {
    store,
    read,
  };
};
