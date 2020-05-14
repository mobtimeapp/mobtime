import { h } from 'https://unpkg.com/hyperapp?module=1';

export const tab = (props, children) => h('button', {
  class: {
    'bg-indigo-400': props.selected,
    'sm:bg-transparent': !props.selected,
    'bg-indigo-700': !props.selected,
    'hover:bg-indigo-500': !props.selected,
    'border-b': !props.selected,
    'border-indigo-300': true,
    'text-white': true,
    'py-1': true,
    'px-3': true,
    'text-2xl': true,
    'w-full': true,
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
  },
  onclick: props.onclick,
}, [
  h('div', {}, children),
  props.details,
]);
