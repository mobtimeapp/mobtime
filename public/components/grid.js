import { h } from '/vendor/hyperapp.js';
import { classConcat } from '/lib/classConcat.js';

export const grid = (props, children) => h(
  'div',
  {
    ...props,
    class: classConcat('grid px-1 md:px-4 grid-cols-2 gap-6', props.class),
  },
  children,
);
