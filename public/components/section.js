import { h } from 'https://unpkg.com/hyperapp?module=1';

export const classes = {
  'pt-5': true,
  'px-4': true,
};

export const section = (props, children) => h('section', {
  ...props,
  class: {
    ...classes,
    ...(props.class || {}),
  },
}, children);
