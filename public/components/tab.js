import { h } from 'https://unpkg.com/hyperapp?module=1';

export const tab = (props, children) => h('button', {
  class: {
    'rounded': true,
    'bg-indigo-400': props.selected,
    'bg-transparent': !props.selected,
    'hover:bg-indigo-300': !props.selected,
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
  props.details && h('div', {
    class: {
      'text-sm': true,
      'text-gray-200': true,
      'p-1': true,
      'rounded': true,
      'bg-green-600': true,
    },
  }, [
    props.details,
  ]),
]);
