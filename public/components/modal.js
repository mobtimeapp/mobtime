import { h } from '/vendor/hyperapp.js';

import { overlay } from '/components/overlay.js';

export const modal = children =>
  overlay([
    h(
      'div',
      {
        class: {
          'p-2': true,
          'mx-2': true,
          'w-full': true,
          'sm:w-3/4': true,
          'sm:mx-0': true,
          'bg-white': true,
          'text-gray-900': true,
          'dark:bg-gray-900': true,
          'dark:text-gray-200': true,
        },
      },
      children,
    ),
  ]);
