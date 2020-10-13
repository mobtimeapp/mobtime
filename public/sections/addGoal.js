import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { input, textarea } from '/components/input.js';
import { button } from '/components/button.js';
import { checkbox } from '/components/checkbox.js';

import * as actions from '/actions.js';

export const addGoal = props =>
  h(section, null, [
    h(
      'form',
      {
        action: '#',
        method: 'get',
        onsubmit: [
          actions.AddGoals,
          e => {
            e.preventDefault();
            return props.goal;
          },
        ],
        class: {
          "flex": true,
          'flex-col': true,
          'items-center': true,
          'justify-start': true,
          'w-full': true,
        },
      },
      [
        !props.addMultiple && [
          h(input, {
            value: props.goal,
            oninput: [actions.UpdateGoalText, e => e.target.value],
            placeholder: 'Add Goal',

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
        ],

        props.addMultiple && [
          h(textarea, {
            onchange: [actions.UpdateGoalText, e => e.target.value],
            value: props.goal,
            placeholder:
              'Add Goals\nOne goal per line\nAs many as you would like',
            class: {
              'text-3xl': true,
              'font-bold': true,
              'bg-indigo-600': true,
              'text-white': true,
              'w-full': true,
            },
          }),
        ],

        h(
          'div',
          {
            class: {
              "flex": true,
              'items-center': true,
              'justify-between': true,
              'pt-2': true,
              'w-full': true,
            },
          },
          [
            h(
              checkbox,
              {
                id: 'goals-allow-multiple',
                checked: props.addMultiple,
                inputProps: {
                  onchange: [
                    actions.SetAddMultiple,
                    e => {
                      e.preventDefault();
                      return e.target.checked;
                    },
                  ],
                },
              },
              'Add multiple goals',
            ),

            h(
              button,
              {
                type: 'submit',
                class: {
                  'bg-green-600': true,
                  'text-white': true,
                  'whitespace-no-wrap': true,
                },
              },
              [h('i', { class: 'fas fa-plus mr-3' }), 'Add'],
            ),
          ],
        ),
      ],
    ),
  ]);
