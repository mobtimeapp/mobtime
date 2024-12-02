import { h } from '../vendor/hyperapp.js';
import { classConcat } from '../lib/classConcat.js';

export const checkbox = (props) =>
  h('input', {
    ...props,
    type: 'checkbox',
    class: classConcat('grow-0 shrink-0 block w-6 h-6', props.class || ''),
  });
