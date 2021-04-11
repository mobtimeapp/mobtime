import { h } from '/vendor/hyperapp.js';

const sizes = {
  sm: { 'px-1': true },
  md: { 'py-1': true, 'px-2': true },
  lg: { 'py-2': true, 'px-4': true },
};

export const button = (props = {}, children) =>
  h(
    'button',
    {
      type: 'button',
      ...props,
      class: {
        ...(sizes[props.size] || sizes.lg),
        'tracking-widest': true,
        "uppercase": true,
        "shadow": 'shadow' in props ? props.shadow : true,
        ...(props.class || {}),
      },
    },
    [].concat(children),
  );
