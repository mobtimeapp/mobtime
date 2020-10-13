import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const mobber = props =>
  h(
    section,
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
        'mb-3': true,
        'h-full': true,
        'w-full': true,
        "truncate": props.truncate,
      },
    },
    [
      h(
        'div',
        {
          class: {
            truncate: props.truncate,
          },
        },
        [
          h(
            'div',
            {
              class: {
                "uppercase": true,
                'text-lg': true,
                'font-extrabold': props.position !== 'mob',
                'leading-none': true,
                'mb-1': true,
              },
            },
            props.position,
          ),
          h(
            'div',
            {
              class: {
                'text-gray-500': !props.name,
                'text-4xl': true,
                'font-bold': props.position !== 'mob',
                'leading-none': true,
                "truncate": props.truncate,
              },
            },
            props.name || 'Empty',
          ),
        ],
      ),
    ],
  );
