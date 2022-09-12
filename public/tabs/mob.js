import { h } from '/vendor/hyperapp.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';
import { mobParticipants } from '/sections/mobParticipants.js';

export const mob = props =>
  h('div', {}, [
    mobParticipants({
      expandedReorderable: props.expandedReorderable,
      drag: props.drag.type === 'mob' ? props.drag : {},
      mob: props.mob,
      mobOrder: props.settings.mobOrder,
      lang: props.lang,
    }),

    addParticipant({
      name: props.name,
      lang: props.lang,
    }),

    mobActions({
      lang: props.lang,
    }),
  ]);
