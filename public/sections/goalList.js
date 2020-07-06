import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';
import { reorderable } from '/components/reorderable.js';

export const goalList = (props) => h(section, null, [
  h(reorderable, {
    dragType: 'goal',
    items: props.goals,
    renderItem: (item) => h(goal, {
      ...item,
    }),
    drag: props.drag,
    disabled: props.overview,
    onDelete: props.overview
      ? undefined
      : actions.RemoveGoal,
    onMove: props.overview
      ? undefined
      : actions.MoveGoal,
  }),
]);
