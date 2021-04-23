import { h } from '/vendor/hyperapp.js';

export const classes = {
  'pt-5': true,
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
