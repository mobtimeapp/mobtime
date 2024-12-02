import * as actions from '/actions.js';

import { section } from '/components/section.js';
import { goal } from '/components/goal.js';
import { reorderable } from '/components/reorderable.js';

const temporaryGoals = ({ lang }) => [
  {
    text: lang.goals.goodDay,
    completed: false,
    id: null,
    disabled: true,
  },
  {
    text: lang.goals.greatDay,
    completed: false,
    id: null,
    disabled: true,
  },
];

const getReorderableId = item => `goal-${item.id}`;

export const goalList = props => {
  const tempGoals = temporaryGoals(props);
  const padding = Math.max(0, tempGoals.length - props.goals.length);
  const items = props.goals.concat(
    padding > 0 ? tempGoals.slice(-padding) : [],
  );

  return section({}, [
    reorderable({
      dragType: 'goal',
      expandedReorderable: props.expandedReorderable,
      items,
      renderItem: item =>
        goal({
          ...item,
          highlight: props.forms.goal.id === item.id,
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
