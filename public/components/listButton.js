import { h } from '/vendor/hyperapp.js';

export const listButton = (props, children) =>
  h(
    'button',
    {
      ...props,
      class: {
        'box-border': true,
        'w-6': true,
        'h-6': true,
        'text-sm': true,
        'flex-shrink-0': true,
        flex: true,
        'items-center': true,
        'justify-center': true,
        ...(props.class || {}),
      },
    },
    children,
  );
