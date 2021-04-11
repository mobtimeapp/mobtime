import { h } from '/vendor/hyperapp.js';
import { card } from './card.js';

export const layout = children =>
  h(
    'div',
    {
      class: {
        "flex": true,
        'items-start': true,
        'justify-center': true,
        'min-h-screen': true,

        'bg-white': true,
        'text-gray-900': true,

        'dark:bg-gray-900': true,
        'dark:text-gray-200': true,
      },
    },
    [
      card(
        {
          class: {
            'box-border': true,
            'min-h-screen': true,
            'sm:min-h-0': true,
            'w-full': true,
            'sm:w-8/12': true,
            'md:w-10/12': true,
            'lg:w-6/12': true,
            'pt-2': false,
            'pt-0': true,
            'pb-12': true,
            'pb-1': false,
            'sm:mt-2': true,
          },
        },
        children,
      ),
    ],
  );
