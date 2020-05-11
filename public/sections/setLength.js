import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { input } from '/components/input.js';

import * as actions from '/actions.js';

export const setLength = (props) => h(section, null, [
  h('h2', {
    class: {
      'text-lg': true,
      'font-bold': true,
      'uppercase': true,
    },
  }, 'Set Length'),

  h('div', {
    class: {
      'flex': true,
      'flex-row': true,
      'items-center': true,
      'justify-between': true,
      'w-full': true,
    },
  }, [
    h(input, {
      name: 'value',
      type: 'number',
      min: 1,
      max: 60,
      step: 1,
      value: props.timeInMinutes,
      oninput: [actions.UpdateTimeInMinutes, (e) => e.target.value],

      class: {
        'text-4xl': true,
        'font-extrabold': true,
        'hover:border-indigo-300': true,
        'hover:border-b-solid': true,
        'bg-indigo-600': true,
        'text-white': true,
        'w-1/3': true,
        'text-center': true,
      },
    }),

    h('span', {
      class: {
        'text-4xl': true,
        'font-extrabold': true,
      },
    }, 'minutes'),
  ]),
]);
