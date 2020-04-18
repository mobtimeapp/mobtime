import { h } from 'https://unpkg.com/hyperapp?module=1';
import { deleteButton } from '/components/deleteButton.js';
import * as actions from '/actions.js';

export const goal = (props) => h('div', {
  class: {
    'flex': true,
    'flex-row': true,
    'items-center': true,
    'justify-between': true,
    'mb-2': true,
  },
}, [
  h('label', {
    class: {
      'w-full': true,
      'pl-4': true,
      'flex': true,
      'flex-row': true,
      'items-center': true,
      'justify-between': true,
      'flex-grow': true,
      'mr-2': true,
    },
  }, [
    h('input', {
      type: 'checkbox',
      checked: props.completed,
      onchange: [actions.CompleteGoal, (e) => ({ text: props.text, completed: e.target.checked })],
      class: {
        'mr-3': true,
      },
    }),
    h('div', {
      class: {
        'line-through': props.completed,
        'text-2xl': true,
        'flex-grow': true,
        'leading-tight': true,
      },
    }, props.text),
  ]),
  h(deleteButton, {
    size: '24px',
    onclick: [actions.RemoveGoal, props.text],
  }),
]);
