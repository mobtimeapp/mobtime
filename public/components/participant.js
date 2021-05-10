import { h, text } from '../vendor/hyperapp.js';

const profileAvatar = ({ name, avatar }) => {
  const initials = (name || '')
    .split(/\s/)
    .map(w => w.replace(/[^A-Za-z0-9]/g, ''))
    .filter(w => w)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return h(
    'div',
    {
      class: [
        'w-12 h-12',
        'rounded-full border-4 border-gray-700',
        'mr-2',
        'flex items-center justify-center',
      ],
      style: {
        backgroundImage: `url("${avatar}")`,
        backgroundSize: 'cover',
      },
    },
    [!avatar && text(initials)],
  );
};

export const participant = ({ id, name, avatar, position }, isSelf = false) =>
  h(
    'div',
    {
      class: [
        'flex items-center justify-start',
        'pb-2 mb-2 px-2 py-1',
        'border-l-2',
        isSelf
          ? 'border-red-700 dark:border-red-700'
          : 'border-gray-100 dark:border-gray-700',
        'bg-gray-100 dark:bg-gray-800',
        'w-full',
      ],
    },
    [
      profileAvatar({ name, avatar }),
      h(
        'div',
        {
          class: ['flex flex-col items-start justify-center'],
        },
        [
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
            text(
              !position
                ? 'Support'
                : position.length > 32
                ? `${position.slice(0, 32)}...`
                : position,
            ),
          ),
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
