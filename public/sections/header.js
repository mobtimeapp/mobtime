import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

import * as actions from '/actions.js';

export const header = state =>
  section(
    {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-start': true,
        'w-full': true,
        'md:col-span-2': true,
        'text-black': true,
        'dark:text-white': true,
      },
    },
    [
      h('div', {
        class: 'fas fa-clock text-4xl mr-3',
      }),
      h(
        'div',
        {
          class: {
            'uppercase': true,
            'tracker-widest': true,
            'text-2xl': true,
            'flex-grow': true,
          },
        },
        text(state.lang.header.product),
      ),

      h('button', {
        type: 'button',
        class: {
          'text-xs': true,
          'text-slate-600': true,
        },
        onclick: [actions.ToggleDrawer, { showDrawer: true }],

      }, text('Show Advanced Settings')),

    ],
  );
