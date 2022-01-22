import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

export const mobber = props =>
  h(
    'div',
    {
      class: {
        flex: true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
        'mb-1': true,
        'h-full': true,
        'w-full': true,
        truncate: props.truncate,
        'bg-indigo-50': props.position !== 'mob',
        'dark:bg-indigo-800': props.position !== 'mob',
        'py-2': true,
        'pl-1': true,
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
                uppercase: true,
                'leading-none': true,
                'mb-1': true,
              },
            },
            text(props.position),
          ),
          h(
            'div',
            {
              class: {
                'text-gray-500': !props.name,
                'font-bold': props.position !== 'mob',
                'leading-none': true,
                truncate: props.truncate,
              },
            },
            text(props.name || 'Empty'),
          ),
        ],
      ),
    ],
  );
