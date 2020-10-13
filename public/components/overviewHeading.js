import { h } from '/vendor/hyperapp.js';

export const overviewHeading = (props, children) =>
  h(
    'div',
    {
      ...props,
      class: {
        ...props.class,
        'px-1': true,
        'mx-5': true,
        'pt-3': true,
        "flex": true,
        'flex-row': true,
        'items-end': true,
        'justify-between': true,
        'border-b': true,
      },
    },
    [
      h(
        'h2',
        {
          class: {
            'text-lg': true,
            'font-bold': true,
            'py-1': true,
          },
        },
        children,
      ),
      props.rightAction || h('div', {}),
    ],
  );
