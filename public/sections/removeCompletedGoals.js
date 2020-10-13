import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import * as actions from '/actions.js';

export const removeCompletedGoals = props => {
  const anyCompletedGoals = props.goals.some(goal => goal.completed);
  if (!anyCompletedGoals) {
    return null;
  }
  return h(section, null, [
    h(
      'form',
      {
        action: '#',
        method: 'get',
        onsubmit: [
          actions.RemoveCompletedGoals,
          e => {
            e.preventDefault();
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
        h(
          'div',
          {
            class: {
              "flex": true,
              'items-center': true,
              'justify-end': true,
              'pt-2': true,
              'w-full': true,
            },
          },
          [
            h(
              button,
              {
                type: 'submit',
                class: {
                  'bg-orange-800': true,
                  'text-white': true,
                  'whitespace-no-wrap': true,
                },
              },
              [h('i', { class: 'fas fa-trash mr-3' }), 'Clear completed goals'],
            ),
          ],
        ),
      ],
    ),
  ]);
};
