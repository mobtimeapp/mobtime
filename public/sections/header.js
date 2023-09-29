import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const header = state =>
  section(
    {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-start': true,
        'w-full': true,
        'text-black': true,
        'dark:text-white': true,
      },
    },
    [
      h('div', {
        innerHTML: '🕐',
        class: 'text-4xl mr-3',
      }),
      h(
        'div',
        {
          class: {
            'uppercase': true,
            'tracker-widest': true,
            'text-2xl': true,
            'flex-grow': true,
          },
        },
        text(state.lang.header.product),
      ),

    ],
  );
