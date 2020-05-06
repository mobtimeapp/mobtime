import { h } from 'https://unpkg.com/hyperapp?module=1';

export const tab = (props, children) => h('button', {
  class: {
    'rounded': true,
    'bg-indigo-400': props.selected,
    'bg-transparent': !props.selected,
    'hover:bg-indigo-300': !props.selected,
    'text-white': true,
    'py-1': true,
    'text-2xl': true,
    'text-center': true,
    'w-full': true,
  },
  onclick: props.onclick,
}, children);
