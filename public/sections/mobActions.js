import { text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const mobActions = () =>
  section(
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    },
    [
      button(
        {
          class: {
            'text-indigo-600': true,
            'flex-grow': true,
            'mr-1': true,
          },
          onclick: actions.CycleMob,
        },
        text('Rotate'),
      ),

      button(
        {
          class: {
            'text-indigo-600': true,
            'flex-grow': true,
            'ml-1': true,
          },
          onclick: actions.ShuffleMob,
        },
        text('Randomize'),
      ),
    ],
  );
