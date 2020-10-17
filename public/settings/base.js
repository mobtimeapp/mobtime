import { h } from '/vendor/hyperapp.js';

export const base = (props, children) =>
  h(
    'div',
    {
      class: {
        "grid": true,
        'gap-2': true,
        'px-8': true,
        'mb-4': true,
      },
      style: {
        gridTemplateColumns: '35% auto',
      },
    },
    [
      h(
        'h2',
        {
          ...props,
          class: {
            ...(props.class || {}),
            "flex": true,
            'items-center': true,
            'sm:justify-end': true,
            'sm:text-right': true,
            'text-2xl': true,
            'font-bold': true,
            "uppercase": true,
          },
        },
        props.title,
      ),
      h(
        'div',
        {
          class: {
            "flex": true,
            'items-end': true,
            'sm:justify-start': true,
            'w-full': true,
            'overflow-hidden': true,
          },
        },
        children,
      ),
    ],
  );
