import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';

export const goalList = (props) => h(section, null, [
  props.goals.map(({ text, completed }) => h(goal, {
    text,
    completed,
  })),
]);
