import { h } from '/vendor/hyperapp.js';

export const overlay = (props = {}, children) =>
  h(
    'div',
    {
      ...props,
      class: {
        "absolute": true,
        'inset-0': true,
        "flex": true,
        'items-center': true,
        'justify-center': true,
        'z-40': true,
        ...props.class,
      },
    },
    children,
  );
