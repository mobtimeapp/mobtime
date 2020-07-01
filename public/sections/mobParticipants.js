
import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { section } from '/components/section.js';
import { reorderable } from '/components/reorderable.js';
import { mobber } from '/components/mobber.js';

export const mobParticipants = (props) => {
  const [mobNavigator, mobDriver, ...rest] = props.mob;

  const items = [
    { ...mobNavigator, position: 'Navigator' },
    { ...mobDriver, position: 'Driver' },
    ...rest.map((m) => ({ ...m, position: 'mob' })),
  ];

  return h(section, null, [
    h('div', null, h(reorderable, {
      dragType: 'mob',
      items,
      renderItem: (item) => h(mobber, {
        ...item,
      }),
      drag: props.drag,
      disabled: props.overview,
      onDelete: props.overview
        ? undefined
        : actions.RemoveFromMob,
    })),
  ]);
};
