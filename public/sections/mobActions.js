import { text, h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const mobActions = () =>
  section(
    {
      class: {
        flex: true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    },
    [
      button(
        {
          class: {
            'bg-green-600': true,
            'text-white': true,
            'flex-grow': true,
            'mr-1': true,
          },
          onclick: actions.CycleMob,
        },
        [h('x-icon', { class: 'inline fas fa-sync-alt mr-1' }), text('Rotate')],
      ),

      button(
        {
          class: {
            'bg-green-600': true,
            'text-white': true,
            'flex-grow': true,
            'ml-1': true,
          },
          onclick: actions.ShuffleMob,
        },
        [
          h('x-icon', { class: 'inline fas fa-random mr-1' }),
          text('Randomize'),
        ],
      ),
    ],
  );
