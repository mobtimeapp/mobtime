import { h } from 'https://unpkg.com/hyperapp?module=1';

export const badge = (props, children) => h('div', {
  ...props,
  class: {
    'text-sm': true,
    'text-gray-200': true,
    'p-1': true,
    'rounded': true,
    'bg-green-600': true,
  },
}, children);
