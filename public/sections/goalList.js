import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';

export const goalList = (props) => h(section, null, [
  h('h2', {
    class: {
      'text-lg': true,
      'font-bold': true,
      'uppercase': true,
    },
  }, 'Goals'),

  props.goals.map(({ text, completed }) => h(goal, {
    text,
    completed,
  })),

  h('div', {
    class: {
      'hidden': props.goals.length > 0,
    },
  }, 'No goals, add one now'),
]);
