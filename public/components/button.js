import { h } from 'https://unpkg.com/hyperapp?module=1';

export const button = (props = {}, children) => h(
  'button',
  {
    type: 'button',
    ...props,
    class: {
      'py-2': true,
      'px-4': true,
      'font-semibold': true,
      'border': true,
      'hover:text-white': !props.disabled,
      'hover:bg-blue-500': !props.disabled,
      'hover:border-transparent': !props.disabled,
      'rounded': true,
      'text-blue-700': !props.disabled,
      'border-blue-500': !props.disabled,
      'text-blue-500': !props.disabled,
      'border-blue-300': !props.disabled,
      ...(props.class || {}),
    },
  },
  children,
);
