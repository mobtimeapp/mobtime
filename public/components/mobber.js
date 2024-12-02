import { h, text } from '/vendor/hyperapp.js';
import * as actions from '/actions.js';

export const mobber = props =>
  h(
    'div',
    {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
        // 'mb-1': true,
        'h-full': true,
        'w-full': true,
        'text-black': props.hasPosition,
        'dark:text-white': props.hasPosition,
        // 'bg-indigo-50': props.position !== 'mob',
        // 'dark:bg-indigo-800': props.position !== 'mob',
        'py-1': true,
        'pl-1': true,
        'outline': props.highlight,
        'outline-blue-300': true,
      },
    },
    [
      h(
        'div',
        {
          class: {
            'truncate': props.selected,
            'border-b': true,
            'border-dotted': true,
            'border-transparent': true,
            'hover:border-slate-400': props.name,
          },
          ondblclick: [actions.MobDoubleClick, { id: props.id }],
          title: 'Double click to edit',
        },
        [
          h(
            'div',
            {
              class: {
                'uppercase': true,
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
                'text-gray-500': !props.name,
                'dark:text-gray-600': !props.name,
                'font-lg': true,
                'font-bold': props.hasPosition && props.name,
                'leading-none': true,
                'break-all': true,
                'truncate': props.selected,
              },
            },
            text(props.name || 'Empty'),
          ),
        ],
      ),
    ],
  );
