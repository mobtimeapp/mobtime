const normalize = (classes) => {
  if (typeof classes === 'string') {
    return classes;
  } else if (Array.isArray) {
    return classes.filter(Boolean).map(normalize).join(' ');
  } else if (!classes) {
    return '';
  }
  return normalize(
    Object.keys(classes)
      .reduce((memo, key) => memo.concat(classes[key] ? key : []), []),
  );
};

export const classConcat = (...definitions) => normalize(definitions);
