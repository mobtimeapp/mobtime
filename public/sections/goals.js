import { h, text } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';
import { column } from '../components/column.js';
import * as actions from '../actions.js';

const item = ({ id, text: goalText, completed }) =>
  h(
    'li',
    {
      class:
        'pb-2 mb-2 border-l-2 border-gray-100 dark:border-gray-700 px-2 bg-gray-100 dark:bg-gray-800 py-1 block',
    },
    [
      h(
        'label',
        {
          class: 'block flex flex-row items-start justify-start',
        },
        [
          h(
            'div',
            {
              class: 'w-8 h-8 flex items-center justify-center',
            },
            [
              h('input', {
                type: 'checkbox',
                checked: completed,
                onchange: (state, event) => {
                  return actions.CompleteGoal(state, {
                    id,
                    completed: event.target.checked,
                  });
                },
              }),
            ],
          ),
          h(
            'span',
            {
              class: ['text-xl flex-grow', completed && 'line-through'],
            },
            text(goalText),
          ),
        ],
      ),
    ],
  );

export const goals = ({ goals: list }) =>
  section({}, [
    h('div', {}, [
      column('Goals', [
        h(
          'ol',
          {
            class: 'py-2',
          },
          list.map(item),
        ),
      ]),
    ]),
  ]);
