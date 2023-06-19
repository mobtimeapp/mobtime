import { h, text } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

const textWithBreaks = goalText =>
  goalText
    .split('\n')
    .reduce((result, t) => [...result, text(t), h('br', {})], [])
    .slice(0, -1);

const indentRegex = () => /^[- ]+/;
const shouldIndent = (text) => indentRegex().test(text);
const normalizeText = (text) => text.replace(indentRegex(), '');

export const goal = props => {
  const indent = shouldIndent(props.text);
  const text = normalizeText(props.text);

  return h(
    'div',
    {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
        'mb-2': true,
        'w-full': true,
        'break-words': true,
        'truncate': props.truncate,
        'outline': props.highlight,
        'outline-blue-300': true,
        'ml-6': indent,
      },
    },
    [
      h('input', {
        id: `goal-${props.id}`,
        type: 'checkbox',
        checked: props.completed,
        onchange: (_, e) => [
          actions.CompleteGoal,
          { id: props.id, completed: e.target.checked },
        ],
      }),
      h(
        'label',
        {
          // for: `goal-${props.id}`,
          class: {
            'ml-2': true,
            'pr-1': true,
            'flex-grow': true,
            'leading-tight': true,
            'text-gray-500': props.id === null,
            'break-words': true,
            'truncate': props.truncate,
            'block': true,
            'border-b': true,
            'border-dotted': true,
            'border-transparent': true,
            'hover:border-slate-400': props.id,
          },
          ondblclick: (_props, _event) => {
            return [actions.SetFormId, { form: 'goal', id: props.id, input: props.text }];
          },
        },
        textWithBreaks(text || ''),
      ),
    ],
  );
};
