import { h, text } from '../vendor/hyperapp.js';

import { card } from './card.js';
import { button } from './button.js';

import { combineClass } from '../lib/combineClass.js';

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
      class: 'p-1 bg-indigo-700 text-white flex items-center justify-between',
    },
    [
      h(
        'section',
        {
          class: combineClass(containterClasses, [
            'mx-auto',
            'px-4',
            'flex items-center justify-between',
          ]),
        },
        [
          h('div', { class: 'mr-2' }, text(message)),

          h('div', {}, [
            ...actions.map(action =>
              button(
                {
                  color: 'blue',
                  textColor: 'white',
                  transparent: true,
                  class: ['mr-2', 'border border-white text-white'],
                  onclick: action.onclick,
                },
                text(action.text),
              ),
            ),
            button(
              {
                type: 'button',
                color: 'blue',
                textColor: 'white',
                transparent: true,
                class: ['text-gray-300', 'hover:text-gray-100'],
                onclick: Actions.DismissToast,
              },
              text('Dismiss'),
            ),
          ]),
        ],
      ),
    ],
  );

export const layout = ({ toastMessages, modal }, children) =>
  h(
    'div',
    {
      class: [
        'flex flex-col items-center justify-start',
        'min-h-screen',
        !!modal && 'overflow-hidden',
      ],
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
          class: combineClass(containterClasses, [
            'min-h-screen sm:min-h-0',
            'pt-2 px-2 pb-12 pb-1 sm:mt-2',
          ]),
        },
        children,
      ),
    ],
  );
