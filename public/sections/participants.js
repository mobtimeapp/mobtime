import { h, text } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';
import { column } from '../components/column.js';

const participant = ({ id, name, avatar, position }) =>
  h(
    'li',
    {
      class:
        'pb-2 mb-2 border-l-2 border-gray-100 dark:border-gray-700 px-2 bg-gray-100 dark:bg-gray-800 py-1 block',
    },
    [
      position &&
        h(
          'h5',
          {
            class:
              'text-xs font-bold uppercase tracking-widest block text-gray-400',
          },
          text(position),
        ),
      h(
        'div',
        {
          class: 'block flex flex-row items-center justify-start',
        },
        [
          h('div', {
            class: 'w-8 h-8 rounded-full border-2 border-gray-700 mr-1',
            style: {
              backgroundImage: `url("${avatar ||
                'https://media.giphy.com/media/UoYBS36tOHzCBUdRNf/giphy.gif'}")`,
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

const activeParticipantList = ({ positions }, mob = []) =>
  h(
    'ol',
    {
      class: 'py-2',
    },
    [
      ...positions.map((position, index) =>
        participant({
          position,
          ...(mob[index] ? mob[index] : {}),
        }),
      ),
    ],
  );

const passiveParticipantList = (mob = []) =>
  h(
    'ol',
    {
      class: 'py-2',
    },
    mob.map(({ name }) => participant({ name, position: 'Bench' })),
  );

export const participants = ({ activeMob, passiveMob }, positions) =>
  section({}, [
    h('div', { class: '' }, [
      column('Participants', [activeParticipantList({ positions }, activeMob)]),
      column('The Bench', [passiveParticipantList(passiveMob)]),
    ]),
  ]);
