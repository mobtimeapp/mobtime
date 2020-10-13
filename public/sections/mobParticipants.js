import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { section } from '/components/section.js';
import { reorderable } from '/components/reorderable.js';
import { mobber } from '/components/mobber.js';

const getReorderableId = item => `mob-${item.id}`;

export const mobParticipants = props => {
  const mobOrder = (props.mobOrder || 'Navigator,Driver').split(',');

  const length =
    props.mob.length > 0
      ? Math.max(props.mob.length, mobOrder.length)
      : mobOrder.length;

  const items = Array.from({ length }, (_, index) => ({
    ...(props.mob[index] || {}),
    position: mobOrder[index] || 'mob',
  }));

  return h(section, null, [
    h(
      'div',
      null,
      h(reorderable, {
        dragType: 'mob',
        expandedReorderable: props.expandedReorderable,
        items,
        renderItem: item =>
          h(mobber, {
            ...item,
            truncate: getReorderableId(item) === props.expandedReorderable,
          }),
        drag: props.drag,
        disabled: props.overview,
        onDelete: props.overview ? undefined : actions.RemoveFromMob,
        onMove: props.overview ? undefined : actions.MoveMob,
        getReorderableId,
        onEdit: props.overview ? undefined : actions.RenameUserPrompt,
      }),
    ),
  ]);
};
