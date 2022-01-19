import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const addParticipant = props =>
  section({}, [
    h(
      'form',
      {
        action: '#',
        method: 'get',
        onsubmit: (_, e) => {
          e.preventDefault();
          return [actions.AddNameToMob, {}];
        },
        class: {
          flex: true,
          'flex-row': true,
          'items-center': true,
          'justify-between': true,
          'w-full': true,
        },
        autocomplete: 'off',
      },
      [
        h(
          'div',
          {
            class: {
              'flex-grow': true,
              'overflow-hidden': true,
              'mr-4': true,
            },
          },
          input({
            value: props.name,
            oninput: (_, e) => [actions.UpdateName, e.target.value],
            placeholder: 'Add Person',

            class: {
              'hover:border-gray-400': true,
              'hover:border-b-solid': true,
              'w-full': true,
            },
          }),
        ),

        button(
          {
            type: 'submit',
            class: {
              'bg-green-600': true,
              'text-white': true,
              'flex-shrink': true,
              'whitespace-no-wrap': true,
            },
          },
          [h('i', { class: 'fas fa-plus mr-3' }), text('Add')],
        ),
      ],
    ),
  ]);
