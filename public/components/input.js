import { h } from 'https://unpkg.com/hyperapp?module=1';

export const input = (props) =>  h('input', {
  ...props,
  class: {
    'border-b': true,
    'border-b-dotted': true,
    'mx-1': true,
    'hover:border-blue-500': true,
    'hover:border-b-solid': true,
    ...(props.class || {}),
  },
});

