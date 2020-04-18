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
    'bg-transparent': props.position === 'mob',
    'bg-blue-100': props.position !== 'mob',
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
        'text-gray-500': !props.name,
      },
    }, props.name || 'Empty'),
    h('div', {
      class: {
        'uppercase': true,
        'text-xs': true,
        'text-gray-400': props.position === 'mob',
        'text-gray-600': props.position !== 'mob',
      },
    }, props.position),
  ]),

  props.name && h(deleteButton, {
    onclick: [props.onRemove, props.name],
  }),
]);
