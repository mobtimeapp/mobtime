import { h } from '../vendor/hyperapp.js';

import { combineClass } from '../lib/combineClass.js';

export const card = (props = {}, children = []) =>
  h(
    'div',
    {
      ...props,
      class: combineClass(['overflow-hidden', 'pt-2', 'pb-1'], props.class),
    },
    children,
  );
