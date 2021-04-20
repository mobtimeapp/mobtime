import { h, text } from '/vendor/hyperapp.js';
import { card } from './card.js';
import * as Actions from '../actions.js';

const containterClasses = {
  'border-box': true,
  'w-full': true,
  'sm:w-10/12': true,
};

const notification = ({ message, actions }) =>
  h(
    'div',
    {
      class: 'p-1 bg-blue-700 text-white flex items-center justify-between',
    },
    [
      h(
        'section',
        {
          class: {
            ...containterClasses,
            'mx-auto': true,
            'px-4': true,
            "flex": true,
            'items-center': true,
            'justify-between': true,
          },
        },
        [
          h('div', { class: 'mr-2' }, text(message)),

          h('div', {}, [
            ...actions.map(action =>
              h(
                'button',
                {
                  class: [
                    'px-3 py-1 my-1 mr-2',
                    'border border-white text-white',
                    'hover:bg-white hover:text-blue-700',
                  ],
                  onclick: action.onclick,
                },
                text(action.text),
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                class: [
                  'px-3 py-1 my-1 mr-2',
                  'text-gray-300',
                  'hover:text-gray-100',
                ],
                onclick: Actions.DismissToast,
              },
              text('Dismiss'),
            ),
          ]),
        ],
      ),
    ],
  );

export const layout = ({ toastMessages }, children) =>
  h(
    'div',
    {
      class: {
        "flex": true,
        'flex-col': true,
        'items-center': true,
        'justify-start': true,
        'min-h-screen': true,
      },
    },
    [
      h(
        'ul',
        {
          class: 'w-full text-sm',
        },
        (toastMessages || []).slice(0, 1).map(n =>
          h(
            'li',
            {
              class: 'mb-2',
            },
            notification(n),
          ),
        ),
      ),
      card(
        {
          class: {
            ...containterClasses,
            'min-h-screen': true,
            'sm:min-h-0': true,
            'pt-2': false,
            'pt-0': true,
            'pb-12': true,
            'pb-1': false,
            'sm:mt-2': true,
          },
        },
        children,
      ),
    ],
  );
