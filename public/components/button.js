import { h } from '/vendor/hyperapp.js';

export const button = (props = {}, children) =>
  h(
    'button',
    {
      type: 'button',
      ...props,
      class: {
        'py-2': true,
        'px-4': true,
        'tracking-widest': true,
        "uppercase": true,
        ...(props.class || {}),
      },
    },
    children,
  );
