import { h, text } from '/vendor/hyperapp.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';
import { mobParticipants } from '/sections/mobParticipants.js';

export const mob = props =>
  h('div', {}, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Team')),
      h('button', { class: 'ml-2 dark:text-white text-black underline' }, text('Shuffle')),
      h('button', { class: 'ml-2 dark:text-white text-black underline' }, text('Rotate')),
    ]),
    mobParticipants({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'mob' ? props.drag : {},
      mob: props.mob,
      mobOrder: props.settings.mobOrder,
      lang: props.lang,
    }),

    // addParticipant({
    //   name: props.name,
    //   lang: props.lang,
    // }),

    // mobActions({
    //   lang: props.lang,
    // }),
  ]);
