import { h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';

const relativeContainer = (props, children) => h('div', {
  ...props,
  class: {
    ...props.class,
    'relative': true,
  },
}, children);

const dragContainer = (props, children) => h('div', {
  class: {
    'hidden': props.isDragSource,
    'pointer-events-none': props.isDragSource,
  },
  onmousemove: !props.isDragSource

}, children);

/*
 * items: []
 * renderItem: () => {}
 * onDragStart => { position, from, to, type }
 * onDragMove => { position }
 * onDragEnd => {}
 * drag: { type, position, to, from }
 * dragType: 'mob'
 */
export const reorderable = (props) => {
  const isDragging = props.drag.type === props.dragType;

  return h('div', {}, [
    h(relativeContainer, {}, [
      props.items.map((item, index) => h(dragContainer, {
        isDragSource: isDragging && props.drag.from === index,
        item,
        index,
      }, props.renderItem(item))),
    ]),
  ]);
};
