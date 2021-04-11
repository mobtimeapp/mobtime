import { h } from '/vendor/hyperapp.js';

export const card = (props, children) =>
  h(
    'div',
    {
      ...props,
      class: {
        'overflow-hidden': true,
        'pt-2': true,
        'pb-1': true,
        ...(props.class || {}),
      },
    },
    children,
  );
