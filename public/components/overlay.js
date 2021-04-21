import { h } from '../vendor/hyperapp.js';

import * as actions from '../actions.js';

export const overlay = children =>
  h(
    'div',
    {
      class: [
        'absolute inset-0',
        'min-h-screen h-full',
        'flex items-start justify-center',
        'bg-gray-900 dark:bg-gray-100 bg-opacity-20 dark:bg-opacity-20',
        'overflow-y-auto',
      ],
      onclick: (state, event) => {
        if (event.target === event.currentTarget) {
          return actions.SetModal(state, null);
        }
        return state;
      },
    },
    children,
  );
