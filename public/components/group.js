import { h, text } from '../vendor/hyperapp.js';

import { section } from './section.js';

export const group = (title, children) =>
  section({ class: 'mb-4 w-full' }, [
    h(
      'h4',
      {
        class: [
          'mb-2',
          'text-lg',
          'border-b border-gray-200 dark:border-gray-700',
          'text-black dark:text-white',
          'w-full',
        ],
      },
      text(title),
    ),
    ...children,
  ]);
