import { h } from 'https://unpkg.com/hyperapp?module=1';
import * as dnd from '/dragAndDrop.js';

const dropZone = (props) => h('div', {
  key: 'reorderable-drop',
  style: {
    left: 0,
    height: `${props.height}px`,
    transition: 'all .3s ease-in-out',
  },
  class: {
    'relative': true,
    'w-full': true,
    'border': true,
    'border-dotted': true,
    'border-white': true,
    'text-center': true,
    'flex': true,
    'items-center': true,
    'justify-center': true,
    'bg-indigo-500': true,
  },
  ondragover: [props.onDragOver, dnd.dragOverDecoder(props.index)],
  ondrop: [props.onDrop, dnd.dropDecoder(props.drag[1])],
}, 'Drop Here');

export const reorderable = (props) => {
  const isDragging = props.drag.length === 2;

  return h(
    'section',
    {
      class: {
        'my-3': true,
      },
      style: {
        position: 'relative',
        width: '100%',
      },
    },
    [
      ...props.items.map((item, index) => [
        (index === props.drag[1]) && (
          h(dropZone, { ...props, index })
        ),
        (index !== props.drag[0]) && h(
          'div',
          {
            style: {
              position: 'relative',
              left: 0,
              height: `${props.height}px`,
              width: '100%',
            },
            key: props.getKey(item),
          },
          [
            props.component({ ...props, ...item, index }),
            isDragging && h('div', {
              ondragover: [props.onDragOver, index],
              style: {
                display: isDragging ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
              },
            }),
            isDragging && h('div', {
              ondragover: [props.onDragOver, index + 1],
              style: {
                display: isDragging ? 'block' : 'none',
                position: 'absolute',
                top: '50%',
                left: 0,
                width: '100%',
                height: '50%',
              },
            }),
          ],
        ),
      ]),
      (props.drag[1] >= props.items.length) && (
        h(dropZone, { ...props, index: props.drag[1] })
      ),
    ],
  );
};
