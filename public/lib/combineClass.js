const classToObject = myClass => {
  if (typeof myClass === 'string') return classToObject(myClass.split(' '));
  if (Array.isArray(myClass)) {
    return myClass
      .filter(str => str)
      .reduce((obj, str) => ({ ...obj, [str]: true }), {});
  }
  return myClass;
};

export const combineClass = (...classes) =>
  classes
    .filter(c => c)
    .reduce(
      (memo, currentClass) => ({
        ...memo,
        ...classToObject(currentClass),
      }),
      {},
    );
