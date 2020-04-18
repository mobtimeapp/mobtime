import { h } from 'https://unpkg.com/hyperapp?module=1';

export const input = (props) => h('input', {
  ...props,
  class: {
    'border-b-4': true,
    'border-b-solid': true,
    'mx-1': true,
    ...(props.class || {}),
  },
});
