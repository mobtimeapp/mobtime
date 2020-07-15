import { h } from '/vendor/hyperapp.js';

export const base = (props, children) => [
  h('h2', {
    ...props,
    class: {
      ...(props.class || {}),
      'flex': true,
      'items-center': true,
      'sm:justify-end': true,
      'text-2xl': true,
      'font-bold': true,
      'uppercase': true,
    },
  }, props.title),
  h('div', {
    class: {
      'flex': true,
      'items-end': true,
      'sm:justify-start': true,
    },
  }, children),
];
