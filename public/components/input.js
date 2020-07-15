import { h } from '/vendor/hyperapp.js';

export const input = (props) => h('input', {
  ...props,
  class: {
    'border-b-4': true,
    'border-b-solid': true,
    'px-2': true,
    ...(props.class || {}),
  },
});
