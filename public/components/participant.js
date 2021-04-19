import { h, text } from '../vendor/hyperapp.js';

export const participant = ({ id, name, avatar, position }) =>
  h(
    'div',
    {
      class: [
        'pb-2 mb-2 px-2 py-1',
        'border-l-2 border-gray-100 dark:border-gray-700',
        'bg-gray-100 dark:bg-gray-800',
        'w-full',
      ],
    },
    [
      position &&
        h(
          'h5',
          {
            class: [
              'block',
              'text-xs font-bold uppercase tracking-widest',
              'text-gray-400',
            ],
            title: position,
          },
          text(position.length > 32 ? `${position.slice(0, 32)}...` : position),
        ),
      h(
        'div',
        {
          class: 'block flex flex-row items-center justify-start',
        },
        [
          avatar &&
            h('div', {
              class: 'w-8 h-8 rounded-full border-2 border-gray-700 mr-1',
              style: {
                backgroundImage: `url("${avatar}")`,
                backgroundSize: 'cover',
              },
            }),
          h(
            'div',
            {
              class: ['text-xl font-bold flex-grow', !id && 'text-gray-500'],
            },
            text(name || 'Empty'),
          ),
        ],
      ),
    ],
  );
