import { h } from '/vendor/hyperapp.js';

export const badge = (props, children) =>
  h(
    'div',
    {
      ...props,
      class: {
        'text-sm': true,
        'text-gray-200': true,
        'py-1': true,
        'px-2': true,
        "rounded": true,
        'bg-green-600': true,
      },
    },
    children,
  );
