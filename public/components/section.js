import { h } from 'https://unpkg.com/hyperapp?module=1';

export const classes = {
  'pt-2': true,
  'pb-1': true,
  'px-1': true,
  'mx-1': true,
  'mb-1': true,
};

export const section = (props, children) => h('section', {
  ...props,
  class: {
    ...classes,
    ...(props.class || {}),
  },
}, children);
