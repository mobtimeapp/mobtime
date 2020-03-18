import { h } from 'https://unpkg.com/hyperapp?module=1';

export const card = (props, children) => h('div', {
  ...props,
  class: {
    'rounded': true,
    'overflow-hidden': true,
    'shadow': true,
    'pt-2': true,
    'pb-1': true,
    ...(props.class || {}),
  },
}, children);
