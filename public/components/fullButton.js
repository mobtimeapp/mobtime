import { h } from 'https://unpkg.com/hyperapp?module=1';

export const fullButton = (props, children) => h('button', {
  ...props,
  class: {
    'w-full': true,
    'bg-blue-500': true,
    'hover:bg-blue-700': true,
    'text-white': true,
    'font-bold': true,
    'py-3': true,
    'px-1': true,
    'text-xl': true,
    'md:text-3xl': true,
    ...(props.class || {}),
  },
}, children);
