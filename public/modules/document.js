export const make = reference => {
  return {
    setTitle: title => {
      reference.title = title; // eslint-disable-line no-param-reassign
    },
  };
};
