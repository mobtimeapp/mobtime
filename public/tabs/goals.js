import { goalList } from '/sections/goalList.js';
import { h, text } from '/vendor/hyperapp.js';
import * as actions from '/actions.js';

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

    h('form', {
      class: 'ml-3 mt-2',
      method: 'get',
      onsubmit: (_, e) => {
        e.preventDefault();
        return [actions.AddGoals, props.goal];
      },
    }, [
      h('details', {}, [
        h('summary', { class: 'text-slate-500 text-xs' }, text('Show goal form')),

        h('label', { class: 'mt-3 uppercase leading-none mb-1 text-xs block' }, text('Add goal')),
        h('input', {
          type: 'text',
          class: 'bg-transparent border-b border-b-white w-full',
          placeholder: 'Name',
          value: props.goal,
          oninput: (_, e) => [actions.UpdateGoalText, e.target.value],
        }),
      ]),
    ]),
  ]);
