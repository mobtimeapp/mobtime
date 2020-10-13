import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const header = () =>
  h(
    section,
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-start': true,
      },
    },
    [
      h('div', {
        class: 'fas fa-clock text-4xl mr-3',
      }),
      h(
        'div',
        {
          class: {
            "uppercase": true,
            'tracker-widest': true,
            'text-2xl': true,
          },
        },
        'mobtime',
      ),
    ],
  );
