const ResultCase = {
  notRequested: Symbol('notRequested'),
  requested: Symbol('requested'),
  available: Symbol('available'),
  error: Symbol('error'),
};

export const caseOf = (caseList, result) => {
  const hasAllCases = Object.keys(ResultCase).every(key => key in caseList);
  const hasFallthrough = '_' in caseList;
  if (!hasAllCases && !hasFallthrough) {
    throw new TypeError(
      'Cannot switch on result case if missing cases and no fallback provided',
    );
  }

  const resultKey = Object.keys(ResultCase).find(
    key => ResultCase[key] === result[0],
  );
  const method = result[resultKey || '_'];

  return method(result[1]);
};

export const Result = {
  notRequested: () => [ResultCase.notRequested],
  requested: name => [ResultCase.requested, name],
  available: instance => [ResultCase.available, instance],
  error: error => [ResultCase.error, error],

  caseOf,
};
