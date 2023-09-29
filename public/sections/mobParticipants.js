import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

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
    highlight: props.forms.mob.id === props.mob[index]?.id,
    disabled: index >= props.mob.length,
    position: mobOrder[index] || props.lang.mob.fallback,
    hasPosition: !!mobOrder[index],
  }));

  return h(
    'div',
    {},
    reorderable({
      dragType: 'mob',
      expandedReorderable: props.expandedReorderable,
      items,
      disabled: props.mob.length === 0 || props.overview,
      renderItem: item =>
        mobber({
          ...item,
          truncate: getReorderableId(item) === props.expandedReorderable,
          selected: getReorderableId(item) === props.expandedReorderable,
        }),
      drag: props.drag,
      getReorderableId,
      onMove: props.overview ? undefined : actions.MoveMob,
      onEdit: props.overview ? undefined : actions.RenameUserPrompt,
      onDelete: props.overview ? undefined : actions.RemoveFromMob,
    }),
  );
};
