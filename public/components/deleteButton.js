import { text } from '/vendor/hyperapp.js';

import { listButton } from './listButton.js';

export const deleteButton = props =>
  listButton(
    {
      ...props,
      class: {
        'text-white': true,
        'bg-red-500': true,
        ...(props.class || {}),
      },
    },
    [text('×')],
  );
