import { h } from 'https://unpkg.com/hyperapp?module=1';

export const classes = {
  'pt-5': true,
  'pb-3': true,
  'px-4': true,
  // FIXME: Don't let this get into the PR
  'border': true,
  'border-white': true,
  'border-dotted': true,
};

export const section = (props, children) => h('section', {
  ...props,
  class: {
    ...classes,
    ...(props.class || {}),
  },
}, children);
