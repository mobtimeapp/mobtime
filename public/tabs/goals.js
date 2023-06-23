import { goalList } from '/sections/goalList.js';
import { h, text } from '/vendor/hyperapp.js';
import * as actions from '/actions.js';

export const goals = props => {
  const isEdittingGoal = props.forms.goal.id && props.goals.some(g => g.id == props.forms.goal.id);
  const anyGoalsIncomplete = props.goals.some(g => !g.completed);

  return h('div', {}, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Goals')),
      anyGoalsIncomplete && h('button', { class: 'ml-2 dark:text-white text-black underline' }, text('Clear Completed')),
    ]),

    goalList({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'goal' ? props.drag : {},
      goals: props.goals,
      lang: props.lang,
      forms: props.forms,
    }),

    h('form', {
      class: 'ml-3 mt-2',
      method: 'get',
      onsubmit: (_, e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        switch (e.submitter.value) {
          case 'update':
            return [actions.RenameGoal, { id: formData.get('id'), value: formData.get('text') }];
          case 'remove':
            return [actions.RemoveGoal, formData.get('id')];
          case 'add':
            return [actions.AddGoals, formData.get('text')];
        }
      },
    }, [
      h('input', { type: 'hidden', name: 'id', value: props.forms.goal.id }),
      h('details', { open: props.forms.goal.open, toggle: (_, event) => [actions.OpenForm, { form: 'goal', open: event.target.open }] }, [
        h('summary', { class: 'text-slate-500 text-xs' }, text('Show goal form')),

        h('div', { class: 'flex items-end justify-items-start' }, [
          h('fieldset', { class: 'flex-grow' }, [
            h('label', { class: 'mt-3 uppercase leading-none mb-1 text-xs block' }, text('A good day would be...')),
            h('input', {
              type: 'text',
              class: 'bg-transparent border-b border-b-white w-full',
              placeholder: 'Finish feature X',
              name: 'text',
              value: props.forms.goal.input,
              required: true,
              oninput: (_, e) => [actions.SetFormInput, { form: 'goal', input: e.target.value }],
              onkeydown: (_, e) => {
                if (e.key === 'Enter' && !isEdittingGoal) {
                  e.preventDefault();
                  return [actions.AddGoals, e.target.value];
                }
                if (e.key === 'Enter' && isEdittingGoal) {
                  e.preventDefault();
                  return [actions.RenameGoal, { id: props.forms.goal.id, value: e.target.value }];
                }
                return [s => s];
              },
            }),
          ]),
          !isEdittingGoal && h('button', { type: 'submit', name: 'action', value: 'add', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Add')),
          isEdittingGoal && h('button', { type: 'submit', name: 'action', value: 'update', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Update')),
          isEdittingGoal && h('button', { type: 'submit', name: 'action', value: 'remove', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Remove')),
          isEdittingGoal && h('button', { type: 'button', name: 'action', value: 'cancel', class: 'ml-1 px-2 py-1 border border-slate-700', onclick: () => [actions.SetFormId, { form: 'mob', id: '' }] }, text('Cancel')),
        ]),
      ]),
    ]),
  ]);
};
