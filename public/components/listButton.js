import { h } from '/vendor/hyperapp.js';

export const listButton = (props, children) =>
  h(
    'button',
    {
      ...props,
      class: {
        'box-border': true,
        'w-8': true,
        'h-8': true,
        'flex-shrink-0': true,
        "flex": true,
        'items-center': true,
        'justify-center': true,
        ...(props.class || {}),
      },
    },
    children,
  );
