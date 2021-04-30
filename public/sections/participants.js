import { h } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';
import { column } from '../components/column.js';
import { participant } from '../components/participant.js';

export const participants = (members, profile = {}) =>
  section({}, [
    h('div', { class: '' }, [
      column('Participants', [
        h(
          'ol',
          {
            class: 'py-2',
          },
          members.map(member =>
            h(
              'li',
              {
                class: ['block'],
              },
              participant(member, profile.id === member.id),
            ),
          ),
        ),
      ]),
    ]),
  ]);
