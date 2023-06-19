import { h, text } from '/vendor/hyperapp.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import * as actions from '/actions.js';

export const mob = props => {
  const isEdittingMember = props.forms.mob.id && props.mob.some(m => m.id == props.forms.mob.id);

  return h('div', {}, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Team')),
      h('button', {
        type: 'button',
        class: 'ml-2 dark:text-white text-black underline',
        onclick: actions.ShuffleMob,
      }, text('Shuffle')),
      h('button', {
        type: 'button',
        class: 'ml-2 dark:text-white text-black underline',
        onclick: actions.CycleMob,
      }, text('Rotate')),
    ]),
    mobParticipants({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'mob' ? props.drag : {},
      mob: props.mob,
      mobOrder: props.settings.mobOrder,
      lang: props.lang,
      forms: props.forms,
    }),

    h('form', {
      class: 'ml-3 mt-2',
      onsubmit: (_, e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        switch (e.submitter.value) {
          case 'update':
            return [actions.RenameUser, { id: formData.get('id'), value: formData.get('name') }];
          case 'remove':
            return [actions.RemoveFromMob, formData.get('id')];
          case 'add':
            return [actions.AddNameToMob, { name: formData.get('name') }];
        }
      },
    }, [
      h('input', { type: 'hidden', name: 'id', value: props.forms.mob.id }),
      h('details', { open: props.forms.mob.open, toggle: (_, event) => [actions.OpenForm, { form: 'mob', open: event.target.open }] }, [
        h('summary', { class: 'text-slate-500 text-xs' }, text('Show member form')),

        h('div', { class: 'flex items-end justify-items-start' }, [
          h('fieldset', { class: 'flex-grow' }, [
            h('label', { class: 'mt-3 uppercase leading-none mb-1 text-xs block' }, text('team member')),
            h('input', {
              type: 'text',
              class: 'bg-transparent border-b border-b-white w-full',
              placeholder: 'Name',
              name: 'name',
              value: props.forms.mob.input,
              required: true,
              oninput: (_, e) => [actions.SetFormInput, { form: 'mob', input: e.target.value }],
            }),
          ]),
          !isEdittingMember && h('button', { type: 'submit', name: 'action', value: 'add', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Add')),
          isEdittingMember && h('button', { type: 'submit', name: 'action', value: 'update', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Update')),
          isEdittingMember && h('button', { type: 'submit', name: 'action', value: 'remove', class: 'ml-1 px-2 py-1 border border-slate-700' }, text('Remove')),
          isEdittingMember && h('button', { type: 'button', name: 'action', value: 'cancel', class: 'ml-1 px-2 py-1 border border-slate-700', onclick: () => [actions.SetFormId, { form: 'mob', id: '' }] }, text('Cancel')),
        ]),
      ]),
    ]),

    // addParticipant({
    //   name: props.name,
    //   lang: props.lang,
    // }),

    // mobActions({
    //   lang: props.lang,
    // }),
  ]);
};
