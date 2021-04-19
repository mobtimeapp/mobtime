import { h, text } from '../vendor/hyperapp.js';

import { section } from '../components/section.js';
import { preventDefault } from '../lib/preventDefault.js';

import * as actions from '../actions.js';

export const header = () =>
  section(
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    },
    [
      h(
        'div',
        {
          class: 'uppercase tracking-widest text-2xl',
        },
        [text('⏱️ mobtime')],
      ),
      h(
        'div',
        {
          class: 'flex flex-row',
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: 'mr-3',
              onclick: preventDefault(() => [actions.SetModal, 'profile']),
            },
            text('👤 Profile'),
          ),
          h('button', { type: 'button', class: 'mr-3' }, text('✏️ Edit Timer')),
        ],
      ),
    ],
  );
