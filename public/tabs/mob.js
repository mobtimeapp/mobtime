import { h, text } from '/vendor/hyperapp.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import * as actions from '/actions.js';

export const mob = props =>
  h('div', {}, [
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
    }),

    h('form', {
      class: 'ml-3 mt-2',
      onsubmit: (_, e) => {
        e.preventDefault();
        return [actions.AddNameToMob, {}];
      },
    }, [
      h('details', {}, [
        h('summary', { class: 'text-slate-500 text-xs' }, text('Show member form')),

        h('label', { class: 'mt-3 uppercase leading-none mb-1 text-xs block' }, text('Add team member')),
        h('input', {
          type: 'text',
          class: 'bg-transparent border-b border-b-white w-full',
          placeholder: 'Name',
          value: props.name,
          oninput: (_, e) => [actions.UpdateName, e.target.value],
        }),
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
