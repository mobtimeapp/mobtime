import { h } from '/vendor/hyperapp.js';

import { overlay } from '/components/overlay.js';
import { card } from '/components/card.js';

export const modal = (props, children) =>
  h(
    overlay,
    {
      ...props,
      class: {
        'pt-12': true,
        'bg-gray-800': true,
        'bg-opacity-25': true,
        ...props.class,
      },
    },
    [
      h(
        card,
        {
          class: {
            'bg-indigo-500': true,
            'text-white': true,
            'px-2': true,
            'max-w-full': true,
            ...props.cardClass,
          },
        },
        children,
      ),
    ],
  );
