import { h } from '/vendor/hyperapp.js';

import { overlay } from '/components/overlay.js';

export const modal = children =>
  overlay([
    h(
      'div',
      {
        class: [
          'px-4 pb-2 mt-16 mx-2',
          'w-full sm:w-3/4 sm:mx-0',
          'bg-white text-gray-900',
          'dark:bg-gray-900 dark:text-gray-200',
        ],
      },
      children,
    ),
  ]);
