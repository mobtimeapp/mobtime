import { isNumber } from './isNumber.js';

export const toSeconds = value => (isNumber(value) ? value * 60000 : value);
