import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { deleteButton } from '/components/deleteButton.js';

const relativeContainer = (props, children) => h('div', {
  ...props,
  class: {
    ...props.class,
    relative: true,
  },
}, children);

const dropTarget = (props, children) => h('div', {
  onmouseenter: [actions.DragTo, { to: props.index }],
  style: {
    alpha: 0.5,
  },
  class: {
    'border-2': true,
    'border-white': true,
    'border-dotted': true,
    'h-20': true,
    'bg-gray-600': true,
    'rounded': true,
  },
}, children);

const dropZoneTrigger = (props) => h('div', {
  class: {
    'absolute': true,
    'w-full': true,
    'bg-transparent': true,
  },
  style: {
    top: props.top,
    left: 0,
    height: '50%',
  },
  onmouseenter: [actions.DragTo, { to: props.index }],
});

const mouseDownDecoder = (type, from) => (event) => ({
  type,
  from,
  clientX: event.clientX,
  clientY: event.clientY,
});

const dragContainer = (props, children) => h('div', {
  class: {
    'hidden': props.isDragFrom,
    'relative': true,
    'select-none': true,
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-start': true,
  },
}, [
  !props.disabled && h('div', {
    class: {
      'h-full': true,
      'flex': true,
      'flex-col': true,
      'items-center': true,
      'justify-between': true,
      'py-8': true,
      'mr-2': true,
      'cursor-move': true,
    },
    onmousedown: [actions.DragSelect, mouseDownDecoder(
      props.dragType,
      props.index,
    )],
  }, Array.from({ length: 3 }, () => h(
    'div',
    {
      class: {
        'border-b': true,
        'border-b-white': true,
        'my-1': true,
        'w-6': true,
      },
    },
  ))),

  children,

  props.onDelete && h(deleteButton, {
    onclick: props.onDelete,
  }),

  props.isDragging && [
    h(dropZoneTrigger, {
      index: props.index,
      top: 0,
    }),
    h(dropZoneTrigger, {
      index: props.index + 1,
      top: '50%',
    }),
  ],
]);

const draggingContainer = (props, children) => h('div', {
  style: {
    position: 'absolute',
    top: `${props.drag.clientY + 5}px`,
    left: `${props.drag.clientX + 5}px`,
    transform: 'rotate(-10deg)',
  },
  class: {
    'transition-all': true,
    'duration-75': true,
    'ease-in-out': true,
    'pointer-events-none': true,
    'border': true,
    'border-green-600': true,
    'rounded': true,
    'bg-indigo-600': true,
  },
}, [
  children,
]);

export const reorderable = (props) => {
  const isDragging = props.drag.type === props.dragType && props.drag.active;
  const isDraggingFrom = (from) => isDragging && from === props.drag.from;
  const isDraggingTo = (to) => isDragging && to === props.drag.to;

  return h('div', {}, [
    h(relativeContainer, {}, [
      ...props.items.map((item, index) => [
        isDraggingTo(index) && h(dropTarget, {
          index,
        }),
        h(dragContainer, {
          isDragging,
          isDragFrom: isDraggingFrom(index),
          index,
          dragType: props.dragType,
          disabled: props.disabled,
          onDelete: props.onDelete && item.id
            ? [props.onDelete, item.id]
            : undefined,
        }, props.renderItem(item)),
      ]),

      isDraggingTo(props.items.length) && h(dropTarget, {
        index: props.items.length,
      }),
    ]),

    isDragging && h(draggingContainer, {
      drag: props.drag,
    }, props.renderItem(props.items[props.drag.from])),
  ]);
};
