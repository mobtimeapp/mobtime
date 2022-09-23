import * as defaultLang from './en-CA.js';

export const en_CA = defaultLang.en_CA;

export { uk_UA } from './uk-UA.js';
export { af_ZA } from './af-ZA.js';

const mergeMissing = (source, dest) => {
  return Object.keys(source).reduce((filled, key) => {
    const value = source[key];
    if (typeof value === 'string' && !(key in filled)) {
      return { ...filled, [key]: value };
    } else if (typeof value === 'object') {
      return { ...filled, [key]: mergeMissing(source[key], dest[key] || {}) };
    }

    return filled;
  }, dest);
};

export const withMissing = lang => {
  if (!lang) {
    return null;
  }

  return defaultLang.en_CA === lang
    ? lang
    : mergeMissing(defaultLang.en_CA, lang);
};
