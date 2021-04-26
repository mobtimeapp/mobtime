import { h } from '../vendor/hyperapp.js';

import { combineClass } from '../lib/combineClass.js';

export const classes = {
  'pt-5': true,
};

export const section = (props, children) =>
  h(
    'section',
    {
      ...props,
      class: combineClass(classes, props.class),
    },
    children,
  );
