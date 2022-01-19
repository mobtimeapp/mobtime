import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { input, textarea } from '/components/input.js';
import { button } from '/components/button.js';
import { checkbox } from '/components/checkbox.js';

import * as actions from '/actions.js';

export const addGoal = props =>
  section({}, [
    h(
      'form',
      {
        action: '#',
        method: 'get',
        onsubmit: (_, e) => {
          e.preventDefault();
          return [actions.AddGoals, props.goal];
        },
        class: {
          flex: true,
          'flex-col': true,
          'items-center': true,
          'justify-start': true,
          'w-full': true,
        },
        autocomplete: 'off',
      },
      [
        !props.addMultiple &&
          input({
            value: props.goal,
            oninput: (_, e) => [actions.UpdateGoalText, e.target.value],
            placeholder: 'Add Goal',
            class: {
              'hover:border-indigo-300': true,
              'hover:border-b-solid': true,
              'w-full': true,
            },
          }),

        props.addMultiple &&
          textarea({
            onchange: (_, e) => [actions.UpdateGoalText, e.target.value],
            value: props.goal,
            placeholder: 'Add Goals\nOne goal per line',
            class: {
              'w-full': true,
            },
          }),

        h(
          'div',
          {
            class: {
              flex: true,
              'items-center': true,
              'justify-between': true,
              'pt-2': true,
              'w-full': true,
            },
          },
          [
            checkbox(
              {
                id: 'goals-allow-multiple',
                checked: props.addMultiple,
                inputProps: {
                  onchange: (_, e) => {
                    e.preventDefault();
                    return [actions.SetAddMultiple, e.target.checked];
                  },
                },
              },
              text('Add multiple goals'),
            ),

            button(
              {
                type: 'submit',
                class: {
                  'bg-green-600': true,
                  'text-white': true,
                  'whitespace-no-wrap': true,
                },
              },
              [h('i', { class: 'fas fa-plus mr-3' }), text('Add')],
            ),
          ],
        ),
      ],
    ),
  ]);
