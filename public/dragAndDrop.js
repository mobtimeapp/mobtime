export const dragDecoder = (index) => (event) => {
  event.dataTransfer.dropEffect = 'move'; // eslint-disable-line no-param-reassign

  return index;
};

export const dragOverDecoder = (index) => (event) => {
  event.preventDefault();

  return index;
};

export const dropDecoder = (index) => (event) => {
  event.preventDefault();

  return index;
};
