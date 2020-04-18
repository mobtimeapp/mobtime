import { h } from 'https://unpkg.com/hyperapp?module=1';
import * as dnd from '/dragAndDrop.js';

/*
 * TODO:
 *   add onDragStart action and pass from index
 *   show drop targets on move
 *   ???
 *   profit
 */

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
          h('div', {
            key: 'reorderable-drop',
            style: {
              position: 'relative',
              left: 0,
              height: `${props.height}px`,
              width: '100%',
              border: '2px black dotted',
              textAlign: 'center',
              transition: 'all .3s ease-in-out',
            },
            ondragover: [props.onDragOver, dnd.dragOverDecoder(index)],
            ondrop: [props.onDrop, dnd.dropDecoder(props.drag[1])],
          }, 'Drop Here')
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
        h('div', {
          key: 'reorderable-drop',
          style: {
            position: 'relative',
            left: 0,
            height: `${props.height}px`,
            width: '100%',
            border: '2px black dotted',
            textAlign: 'center',
            transition: 'all .3s ease-in-out',
          },
          ondragover: [props.onDragOver, dnd.dragOverDecoder(props.drag[1])],
          ondrop: [props.onDrop, dnd.dropDecoder(props.drag[1])],
        }, 'Drop Here')
      ),
    ],
  );
};
