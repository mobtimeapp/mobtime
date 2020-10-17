import { isNumber } from './isNumber.js';

export const toMinutes = value =>
  isNumber(value) ? parseInt(value / 60000, 10) : value;
