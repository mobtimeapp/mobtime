import { h } from '/vendor/hyperapp.js';

export const overlay = children =>
  h(
    'div',
    {
      class: [
        'fixed inset-0',
        'flex items-center justify-center',
        'bg-gray-900 dark:bg-gray-100 bg-opacity-20 dark:bg-opacity-20',
      ],
    },
    children,
  );
