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
      'flex-grow': true,
      'block': true,
    },
  }, [
    h('input', {
      type: 'checkbox',
      checked: props.completed,
      onchange: [actions.CompleteGoal, (e) => ({ text: props.text, completed: e.target.checked })],
    }),
    h('span', {
      class: {
        'ml-2': true,
        'line-through': props.completed,
      },
    }, props.text),
  ]),
  h(deleteButton, {
    size: '24px',
    onclick: [actions.RemoveGoal, props.text]
  }),
]);
