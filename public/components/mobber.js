import { h } from 'https://unpkg.com/hyperapp?module=1';
import { section } from '/components/section.js';
import { deleteButton } from '/components/deleteButton.js';

import * as dnd from '/dragAndDrop.js';

export const mobber = (props) => h(section, {
  class: {
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
    'mb-3': true,
    'cursor-move': !!props.name,
    'h-full': true,
    'w-full': true,
  },
  draggable: !!props.name,
  ondragstart: [props.onDragStart, dnd.dragDecoder(props.index)],
  ondragend: props.onDragEnd,
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

  props.name && h(deleteButton, {
    onclick: [props.onRemove, props.name],
  }),
]);
