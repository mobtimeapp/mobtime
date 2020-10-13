import { h } from '/vendor/hyperapp.js';

export const fullButton = (props, children) =>
  h(
    'button',
    {
      ...props,
      class: {
        'font-bold': true,
        'py-3': true,
        'px-4': true,
        'text-base': true,
        ...(props.class || {}),
      },
    },
    children,
  );
