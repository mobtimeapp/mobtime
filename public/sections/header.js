import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const header = () =>
  section(
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-start': true,
        "uppercase": true,
        'tracker-widest': true,
        'text-2xl': true,
      },
    },
    [h('span', { class: 'mr-1' }, text('⏱️')), text('mobtime')],
  );
