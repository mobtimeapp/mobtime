import { h } from '../vendor/hyperapp.js';

export const input = props =>
  h('input', {
    type: 'text',
    autocomplete: 'off',
    ...props,
    class: [
      'block',
      'max-w-full',
      'w-full',
      'border-b border-gray-200 dark:border-gray-700',
      'invalid:border-red-600 dark:invalid:border-red-600',
      'px-2',
      'bg-transparent',
      ...(props.class || []),
    ],
  });

export const textarea = props =>
  h('textarea', {
    autocomplete: 'off',
    ...props,
    class: [
      'block',
      'border-b border-gray-200 dark:border-gray-700',
      'px-2',
      'resize-y',
      'bg-transparent',
      ...(props.class || []),
    ],
  });
