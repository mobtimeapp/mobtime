import { h } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';
import { column } from '../components/column.js';
import { participant } from '../components/participant.js';

export const participants = members =>
  section({}, [
    h('div', { class: '' }, [
      column('Participants', [
        h(
          'ol',
          {
            class: 'py-2',
          },
          members.map(participant),
        ),
      ]),
    ]),
  ]);
