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
        //'mb-1': true,
        'h-full': true,
        'w-full': true,
        'text-black': props.hasPosition,
        'dark:text-white': props.hasPosition,
        // 'bg-indigo-50': props.position !== 'mob',
        // 'dark:bg-indigo-800': props.position !== 'mob',
        'py-1': true,
        'pl-1': true,
      },
    },
    [
      h(
        'div',
        {
          class: {
            truncate: props.selected,
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
                'break-all': true,
                'text-xs': true,
              },
            },
            text(props.position),
          ),
          h(
            'div',
            {
              class: {
                'text-gray-500': !props.name && !props.hasPosition,
                'dark:text-gray-800': !props.name && !props.hasPosition,
                'font-lg': true,
                'font-bold': props.hasPosition && props.name,
                'leading-none': true,
                'break-all': true,
                truncate: props.selected,
              },
            },
            text(props.name || 'Empty'),
          ),
        ],
      ),
    ],
  );
