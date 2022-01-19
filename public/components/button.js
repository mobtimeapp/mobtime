import { h } from '/vendor/hyperapp.js';

export const button = (props, children) =>
  h(
    'button',
    {
      type: 'button',
      ...(props || {}),
      class: {
        'py-1': true,
        'px-2': true,
        uppercase: true,
        ...(props.class || {}),
      },
    },
    children,
  );
