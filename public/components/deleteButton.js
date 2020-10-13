import { h } from '/vendor/hyperapp.js';

import { listButton } from './listButton.js';

export const deleteButton = props =>
  h(
    listButton,
    {
      ...props,
      class: {
        'text-white': true,
        'bg-red-500': true,
        ...(props.class || {}),
      },
    },
    [
      h('i', {
        class: {
          "fas": true,
          'fa-times': true,
        },
      }),
    ],
  );
