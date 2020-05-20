import { h } from 'https://unpkg.com/hyperapp?module=1';
import { section } from '/components/section.js';
import { deleteButton } from '/components/deleteButton.js';

import * as actions from '/actions.js';

export const mobber = (props) => h(section, {
  class: {
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
    'mb-3': true,
    'cursor-move': !!props.name && !props.overview,
    'h-full': true,
    'w-full': true,
  },
}, [
  h('div', null, [
    h('div', {
      class: {
        'uppercase': true,
        'text-lg': true,
        'font-extrabold': props.position !== 'mob',
        'leading-none': true,
        'mb-1': true,
      },
    }, props.position),
    h('div', {
      class: {
        'text-gray-500': !props.name,
        'text-4xl': true,
        'font-bold': props.position !== 'mob',
        'leading-none': true,
      },
    }, props.name || 'Empty'),
  ]),

  props.name && !props.overview && h(deleteButton, {
    onclick: [actions.RemoveFromMob, props.id],
  }),
]);
