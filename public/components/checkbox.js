import { h } from '../vendor/hyperapp.js';

export const checkbox = (props, children) =>
  h(
    'div',
    {
      class: {
        "flex": true,
        'flex-row': true,
        'items-center': true,
        'justify-center': true,
        'justify-between': true,
      },
    },
    [
      h('input', {
        ...props.inputProps,
        id: props.id,
        type: 'checkbox',
        checked: props.checked,
        class: {
          'mr-3': true,
          'sr-only': true,
        },
      }),
      children &&
        h(
          'label',
          {
            for: props.id,
            class: {
              'flex-grow': true,
              'leading-tight': true,
              "flex": true,
              'flex-row': true,
              'items-center': true,
            },
          },
          [
            h(
              'span',
              {
                class: {
                  'fa-stack': true,
                },
              },
              [
                h('i', { class: 'far fa-circle fa-stack-2x' }),
                props.checked &&
                  h('i', { class: 'fas fa-check fa-stack-1x text-green-500' }),
              ],
            ),
            ...children,
          ],
        ),
    ],
  );
