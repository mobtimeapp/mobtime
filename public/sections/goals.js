import { h, text } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';
import { column } from '../components/column.js';
import * as actions from '../actions.js';

const item = ({ id, text: goalText, completed, parentId }) =>
  h(
    'li',
    {
      class: [
        'block',
        'mb-2 px-2 py-1',
        'border-l-2 border-gray-100 dark:border-gray-700',
        'bg-gray-100 dark:bg-gray-800',
      ],
    },
    [
      h(
        'label',
        {
          class: [
            'flex flex-row items-start justify-start',
            parentId && 'ml-4',
          ],
        },
        [
          h(
            'div',
            {
              class: ['mr-2'],
            },
            [
              h('input', {
                class: ['mt-1'],
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
