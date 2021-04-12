import { h, text } from '/vendor/hyperapp.js';
import { section } from '../components/section.js';

const column = (title, children) =>
  h('div', {}, [
    h(
      'h4',
      {
        class:
          'text-lg font-bold uppercase tracking-widest block border-gray-100 border-b',
      },
      text(title),
    ),
    ...children,
  ]);

const activeParticipantList = ({ settings }, mob = []) =>
  h(
    'ol',
    {},
    (settings.mobOrder || []).map((position, index) =>
      h(
        'li',
        {
          class: 'mb-1',
        },
        [text(position), h('div', {}, text(mob[index].name || 'Empty'))],
      ),
    ),
  );

export const summary = ({ mob, settings }) =>
  section({}, [
    h('div', { class: 'grid sm:grid-cols-2 gap-4' }, [
      column('Active Participants', [
        // activeParticipantList({ settings }, mob),
      ]),
      column('Passive Team', []),
    ]),
  ]);
