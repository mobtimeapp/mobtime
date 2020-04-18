import { h } from 'https://unpkg.com/hyperapp?module=1';

export const deleteButton = props => h('button', {
  ...props,
  class: {
    'rounded-full': true,
    'border': true,
    'flex': true,
    'items-center': true,
    'justify-center': true,
    'text-center': true,
    'border-blue-500': true,
    'hover:text-white': true,
    'hover:bg-blue-500': true,
    'hover:border-transparent': true,
    'fas': true,
    'fa-times': true,
    ...(props.class || {}),
  },
  style: {
    width: props.size || '32px',
    height: props.size || '32px',
  },
});
