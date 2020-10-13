import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const addParticipant = props =>
  h(section, null, [
    h(
      'form',
      {
        action: '#',
        method: 'get',
        onsubmit: [
          actions.AddNameToMob,
          e => {
            e.preventDefault();
            return undefined;
          },
        ],
        class: {
          "flex": true,
          'flex-row': true,
          'items-center': true,
          'justify-between': true,
          'w-full': true,
        },
      },
      [
        h(
          'div',
          {
            class: {
              'flex-shrink': true,
              'overflow-hidden': true,
              'mr-4': true,
            },
          },
          h(input, {
            value: props.name,
            oninput: [actions.UpdateName, e => e.target.value],
            placeholder: 'Add Person',

            class: {
              'text-3xl': true,
              'font-bold': true,
              'hover:border-indigo-300': true,
              'hover:border-b-solid': true,
              'bg-indigo-600': true,
              'text-white': true,
              'w-full': true,
            },
          }),
        ),

        h(
          button,
          {
            type: 'submit',
            class: {
              'bg-green-600': true,
              'text-white': true,
              'flex-grow': true,
              'whitespace-no-wrap': true,
            },
          },
          [h('i', { class: 'fas fa-plus mr-3' }), 'Add'],
        ),
      ],
    ),
  ]);
