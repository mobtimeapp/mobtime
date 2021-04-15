import { h, text } from '/vendor/hyperapp.js';

export const column = (title, children) =>
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
