import { h } from '/vendor/hyperapp.js';

export const classes = {
  'mt-5': true,
  // 'mx-4': true,
};

export const section = (props, children) =>
  h(
    'section',
    {
      ...props,
      class: {
        ...classes,
        ...(props.class || {}),
      },
    },
    children,
  );
