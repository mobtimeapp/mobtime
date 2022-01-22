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
    disabled: index >= props.mob.length,
    position: mobOrder[index] || 'mob',
  }));

  return section({}, [
    h(
      'div',
      {},
      reorderable({
        dragType: 'mob',
        expandedReorderable: props.expandedReorderable,
        items,
        disabled: props.mob.length === 0,
        renderItem: item =>
          mobber({
            ...item,
            truncate: getReorderableId(item) === props.expandedReorderable,
          }),
        drag: props.drag,
        disabled: props.overview,
        getReorderableId,
        onMove: props.overview ? undefined : actions.MoveMob,
        onEdit: props.overview ? undefined : actions.RenameUserPrompt,
        onDelete: props.overview ? undefined : actions.RemoveFromMob,
      }),
    ),
  ]);
};
