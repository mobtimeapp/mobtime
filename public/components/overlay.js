import { h } from '../vendor/hyperapp.js';

import * as actions from '../actions.js';

export const overlay = children =>
  h(
    'div',
    {
      class: [
        'fixed sm:absolute inset-0',
        'flex flex-col items-center justify-center sm:justify-center',
        'bg-gray-900 dark:bg-gray-100 bg-opacity-20 dark:bg-opacity-20',
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
