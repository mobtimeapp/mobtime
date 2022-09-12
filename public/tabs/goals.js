import { addGoal } from '/sections/addGoal.js';
import { goalList } from '/sections/goalList.js';
import { h } from '/vendor/hyperapp.js';
import { removeCompletedGoals } from '/sections/removeCompletedGoals.js';

export const goals = props =>
  h('div', {}, [
    goalList({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'goal' ? props.drag : {},
      goals: props.goals,
      lang: props.lang,
    }),
    addGoal({
      goal: props.goal,
      addMultiple: props.addMultiple,
      lang: props.lang,
    }),
    removeCompletedGoals({ goals: props.goals, lang: props.lang }),
  ]);
