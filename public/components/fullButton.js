import { h } from 'https://unpkg.com/hyperapp?module=1';

export const fullButton = (props, children) => h('button', {
  ...props,
  class: {
    'font-bold': true,
    'py-3': true,
    'px-4': true,
    'text-base': true,
    // 'md:text-3xl': true,
    ...(props.class || {}),
  },
}, children);
