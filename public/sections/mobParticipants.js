
import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { reorderable } from '/components/reorderable.js';
import { mobber } from '/components/mobber.js';

import * as actions from '/actions.js';

export const mobParticipants = (props) => {
  const [mobNavigator, mobDriver, ...rest] = props.mob;

  const items = [
    { name: mobNavigator, position: 'Navigator' },
    { name: mobDriver, position: 'Driver' },
    ...rest.map((name) => ({ name, position: 'mob' })),
  ];

  return h(section, null, [
    h('div', null, h(reorderable, {
      dragType: 'mob',
      items,
      renderItem: (item) => h(mobber, {
        ...item,
        onRemove: !props.overview && actions.RemoveNameFromMob,
      }),
      drag: props.drag,
    })),
  ]);
};
