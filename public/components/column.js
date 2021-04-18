import { h, text } from '/vendor/hyperapp.js';

export const column = (title, children) =>
  h('div', { class: 'mb-2' }, [
    h(
      'h4',
      {
        class: [
          'block',
          'text-lg font-bold uppercase tracking-widest',
          'border-gray-200 border-b',
          'mb-2',
        ],
      },
      text(title),
    ),
    ...children,
  ]);
