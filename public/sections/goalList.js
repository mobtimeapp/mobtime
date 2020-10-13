import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';
import { reorderable } from '/components/reorderable.js';

const temporaryGoals = [
  { text: 'A good day would be...', completed: false, id: null },
  { text: 'A great day would be...', completed: false, id: null },
];

const getReorderableId = item => `goal-${item.id}`;

export const goalList = props => {
  const padding = Math.max(0, temporaryGoals.length - props.goals.length);
  const items = props.goals.concat(
    padding > 0 ? temporaryGoals.slice(-padding) : [],
  );

  return h(section, null, [
    h(reorderable, {
      dragType: 'goal',
      expandedReorderable: props.expandedReorderable,
      items,
      renderItem: item =>
        h(goal, {
          ...item,
          truncate: getReorderableId(item) === props.expandedReorderable,
        }),
      drag: props.drag,
      disabled: props.overview,
      onDelete: props.overview ? undefined : actions.RemoveGoal,
      onMove: props.overview ? undefined : actions.MoveGoal,
      getReorderableId,
      onEdit: props.overview ? undefined : actions.RenameGoalPrompt,
    }),
  ]);
};
