import { h } from '/vendor/hyperapp.js';

export const tab = (props, children) =>
  h(
    'button',
    {
      class: {
        'bg-indigo-400': props.selected,
        'dark:bg-indigo-800': props.selected,
        'text-white': props.selected,
        'hover:bg-gray-200': !props.selected,
        'hover:dark:bg-gray-700': !props.selected,
        'hover:dark:bg-indigo-700': props.selected,
        'border-b': !props.selected,
        'border-indigo-300': true,
        'py-1': true,
        'px-3': true,
        'flex-grow': true,
        flex: true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
      onclick: props.onclick,
    },
    [
      h(
        'div',
        {
          class: {
            uppercase: true,
          },
        },
        children,
      ),
      props.details &&
        h(
          'div',
          {
            class: {
              'ml-2': true,
            },
          },
          props.details,
        ),
    ],
  );
