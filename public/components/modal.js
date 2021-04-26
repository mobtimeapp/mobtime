import { h, text } from '../vendor/hyperapp.js';

import { overlay } from './overlay.js';
import { button } from './button.js';
import { preventDefault } from '../lib/preventDefault.js';

const hasActions = props =>
  (props.left && props.left.length > 0) ||
  (props.right && props.right.length > 0);

export const modal = (props, children) =>
  overlay([
    h(
      'div',
      {
        class: [
          'px-4 pb-2 sm:mx-2',
          'w-full sm:w-3/4 sm:mx-0',
          'max-w-full',
          'max-h-full',
          'h-screen-full sm:h-auto',
          'bg-white text-gray-900',
          'dark:bg-gray-900 dark:text-gray-200',
          'flex flex-col items-center justify-center',
        ],
      },
      [
        h(
          'div',
          {
            class:
              'overflow-y-auto sm:overflow-auto h-full sm:h-auto flex-grow',
          },
          children,
        ),
        hasActions(props) &&
          h(
            'div',
            {
              class: [
                'w-full',
                'flex items-center justify-center',
                'pt-2 mb-1',
                'border-t border-gray-100 dark:border-gray-800',
              ],
            },
            [
              ...(
                props.left || []
              ).map(({ text: label, smText, color, action }) =>
                button(
                  {
                    color,
                    class: 'mr-2',
                    size: 'md',
                    onclick: preventDefault(() => action),
                  },
                  h('span', {}, [
                    h('span', { class: 'hidden sm:inline' }, text(label)),
                    h(
                      'span',
                      { class: 'inline sm:hidden' },
                      text(smText || label),
                    ),
                  ]),
                ),
              ),

              h('div', { class: 'flex-grow' }),

              ...(
                props.right || []
              ).map(({ text: label, smText, color, action }) =>
                button(
                  {
                    color,
                    class: 'ml-2',
                    size: 'md',
                    onclick: preventDefault(() => action),
                  },
                  h('span', {}, [
                    h('span', { class: 'hidden sm:inline' }, text(label)),
                    h(
                      'span',
                      { class: 'inline sm:hidden' },
                      text(smText || label),
                    ),
                  ]),
                ),
              ),
            ],
          ),
      ],
    ),
  ]);
