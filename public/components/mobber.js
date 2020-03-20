import { h } from 'https://unpkg.com/hyperapp?module=1';
import { card } from '/components/card.js';
import { section } from '/components/section.js';

export const mobber = (props) => h(card, {
  class: {
    'mb-3': true,
    'bg-transparent': props.position === 'mob',
    'bg-blue-100': props.position !== 'mob',
  },
}, [
  h(section, {
    class: {
      'flex': true,
      'flex-row': true,
      'items-center': true,
      'justify-between': true,
    },
  }, [
    h('div', null,  [
      h('div', {
        class: {
          'text-gray-500': !props.name,
        },
      }, props.name || 'Empty'),
      h('div', {
        class: {
          'uppercase': true,
          'text-xs': true,
          'text-gray-400': props.position === 'mob',
          'text-gray-600': props.position !== 'mob',
        },
      }, props.position),
    ]),
    props.name && h('button', {
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
        'text-blue-700': true,
      },
      style: {
        width: '32px',
        height: '32px',
      },
      onclick: [props.onRemove, props.name],
    }, 'X'),
  ]),
]);

