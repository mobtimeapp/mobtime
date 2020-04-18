import { h } from 'https://unpkg.com/hyperapp?module=1';

export const button = (props = {}, children) => h(
  'button',
  {
    type: 'button',
    ...props,
    class: {
      'py-2': true,
      'px-4': true,
      'tracking-widest': true,
      'uppercase': true,
      ...(props.class || {}),
    },
  },
  children,
);
