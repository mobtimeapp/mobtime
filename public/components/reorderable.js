import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { deleteButton } from '/components/deleteButton.js';
import { listButton } from '/components/listButton.js';

const relativeContainer = (props, children) =>
  h(
    'div',
    {
      ...props,
      class: {
        ...props.class,
        relative: true,
      },
    },
    children,
  );

const dropTarget = (props, children) =>
  h(
    'div',
    {
      onmouseenter: [actions.DragTo, { to: props.index }],
      style: {
        alpha: 0.5,
      },
      class: {
        'border-2': true,
        'border-gray-200': true,
        'border-dotted': true,
        'h-20': true,
        'bg-gray-100': true,
        'dark:bg-gray-700': true,
        'rounded': true,
      },
    },
    children,
  );

const dropZoneTrigger = props =>
  h('div', {
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

const dragContainer = (props, children) =>
  h(
    'div',
    {
      class: {
        'hidden': props.isDragFrom,
        'relative': true,
        'select-none': true,
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-start': true,
      },
    },
    [
      h(
        'div',
        {
          class: {
            'flex': true,
            // 'hidden': true,
            // 'sm:flex': true,
            'h-full': true,
            'flex-col': true,
            'items-center': true,
            'justify-between': true,
            'py-4': true,
            'mr-2': true,
            'cursor-move': !props.disabled,
          },
          onmousedown: (_, event) =>
            props.disabled
              ? state => state
              : [
                  actions.DragSelect,
                  {
                    type: props.dragType,
                    from: props.index,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  },
                ],
        },
        h('div', { innerHTML: '&#8286;&#8286;&#8286;' }),
        // Array.from({ length: 3 }, (_, index) =>
        //   h('div', {
        //     class: {
        //       'border-b': true,
        //       'border-b-gray-800': !props.disabled,
        //       'border-b-gray-400': props.disabled,
        //       'dark:border-b-gray-200': !props.disabled,
        //       'dark:border-b-gray-400': props.disabled,
        //       'mt-1': index > 0,
        //       'w-1': true,
        //     },
        //   }),
        // ),
      ),

      children,

      h(
        'div',
        {
          class: {
            hidden: !props.expandActions,
            flex: props.expandActions,
          },
        },
        [
          listButton(
            {
              'class': {
                'text-gray-500': !props.onMoveUp,
                'mr-1': true,
              },
              'onclick': props.onMoveUp,
              'disabled': !props.onMoveUp,
              'aria-label': `Move ${props.type} up`,
            },
            [h('span', { class: 'text-bold', innerHTML: '&uarr;' })],
          ),

          listButton(
            {
              'class': {
                'text-gray-500': !props.onMoveDown,
                'mr-1': true,
              },
              'onclick': props.onMoveDown,
              'disabled': !props.onMoveDown,
              'aria-label': `Move ${props.type} down`,
            },
            [h('span', { class: 'text-bold', innerHTML: '&darr;' })],
          ),

          props.onEdit &&
            listButton(
              {
                class: {
                  'mr-2': true,
                },
                onclick: props.onEdit,
              },
              [h('span', { class: 'text-bold', innerHTML: '&#x270E;' })],
            ),

          props.onDelete &&
            deleteButton({
              onclick: props.onDelete,
              class: {
                'mr-1': true,
              },
            }),
        ],
      ),

      props.item.id &&
        !props.disabled &&
        listButton(
          {
            class: {
              'text-indigo-600': props.expandActions,
              'bg-white': props.expandActions,
              'mr-1': true,
            },
            onclick: props.onExpand,
          },
          [h('span', { class: 'text-bold', innerHTML: '&vellip;' })],
        ),

      ...(props.isDragging
        ? [
            dropZoneTrigger({
              index: props.index,
              top: 0,
            }),
            dropZoneTrigger({
              index: props.index + 1,
              top: '50%',
            }),
          ]
        : []),
    ],
  );

const draggingContainer = (props, child) =>
  h(
    'div',
    {
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
        // 'border': true,
        // 'border-green-600': true,
        // 'rounded': true,
      },
    },
    child,
  );

export const reorderable = props => {
  const isDragging = props.drag.type === props.dragType && props.drag.active;
  const isDraggingFrom = from => isDragging && from === props.drag.from;
  const isDraggingTo = to => isDragging && to === props.drag.to;
  const isExpanded = item =>
    props.expandedReorderable === props.getReorderableId(item);

  return h('div', {}, [
    relativeContainer({}, [
      ...props.items.map((item, index) =>
        h('div', {}, [
          isDraggingTo(index) &&
            dropTarget({
              index,
            }),
          dragContainer(
            {
              isDragging,
              isDragFrom: isDraggingFrom(index),
              index,
              item,
              dragType: props.dragType,
              disabled: props.disabled || item.disabled,
              onDelete:
                props.onDelete && item.id
                  ? [props.onDelete, item.id]
                  : undefined,
              onMoveUp:
                props.onMove && item.id && index > 0
                  ? [props.onMove, { from: index, to: index - 1 }]
                  : undefined,
              onMoveDown:
                props.onMove && item.id && index < props.items.length - 1
                  ? [props.onMove, { from: index, to: index + 2 }]
                  : undefined,
              expandActions: isExpanded(item),
              onExpand: [
                actions.ExpandReorderable,
                {
                  expandedReorderable: isExpanded(item)
                    ? null
                    : props.getReorderableId(item),
                },
              ],
              onEdit:
                props.onEdit && item.id
                  ? [props.onEdit, { id: item.id }]
                  : undefined,
            },
            props.renderItem(item),
          ),
        ]),
      ),

      isDraggingTo(props.items.length) &&
        dropTarget({
          index: props.items.length,
        }),
    ]),

    isDragging &&
      draggingContainer(
        {
          drag: props.drag,
        },
        props.renderItem(props.items[props.drag.from]),
      ),
  ]);
};
