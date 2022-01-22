import { h } from '/vendor/hyperapp.js';

export const input = props =>
  h('input', {
    ...props,
    class: {
      'border-b': true,
      'border-b-solid': true,
      'px-2': true,
      'bg-transparent': true,
      ...(props.class || {}),
    },
  });

export const textarea = (props, children) =>
  h(
    'textarea',
    {
      ...props,
      class: {
        'border-b': true,
        'border-b-solid': true,
        'px-2': true,
        'bg-transparent': true,
        ...(props.class || {}),
      },
    },
    children,
  );
