import { addGoal } from '/sections/addGoal.js';
import { goalList } from '/sections/goalList.js';
import { h, text } from '/vendor/hyperapp.js';
import { removeCompletedGoals } from '/sections/removeCompletedGoals.js';

export const goals = props =>
  h('div', {}, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Goals')),
      h('button', { class: 'ml-2 dark:text-white text-black underline' }, text('Clear Completed')),
    ]),

    goalList({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'goal' ? props.drag : {},
      goals: props.goals,
      lang: props.lang,
    }),
    // addGoal({
    //   goal: props.goal,
    //   addMultiple: props.addMultiple,
    //   lang: props.lang,
    // }),
    // removeCompletedGoals({ goals: props.goals, lang: props.lang }),
  ]);
