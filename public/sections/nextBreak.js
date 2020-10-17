import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const nextBreak = () =>
  h(section, {}, [
    h(
      'div',
      {
        class: {
          'tracker-widest': true,
          'text-2xl': true,
        },
      },
      'Start turn to schedule next break.',
    ),
  ]);
