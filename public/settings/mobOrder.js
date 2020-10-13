import { h } from '/vendor/hyperapp.js';

import { input } from '/components/input.js';
import { base } from '/settings/base.js';

import * as actions from '/actions.js';

const value = (key, { pendingSettings, settings }) =>
  key in pendingSettings ? pendingSettings[key] : settings[key];

export const mobOrder = props =>
  h(
    base,
    {
      title: 'Mob order',
    },
    [
      h(
        'div',
        {
          class: {
            'w-full': true,
          },
        },
        [
          h(input, {
            name: 'mobOrder',
            pattern: '^[^,].+[^,]$',
            value: value('mobOrder', props),
            oninput: [
              actions.PendingSettingsSet,
              e => ({
                key: 'mobOrder',
                value: e.target.value,
              }),
            ],

            class: {
              'text-4xl': true,
              'font-extrabold': true,
              'hover:border-indigo-300': true,
              'hover:border-b-solid': true,
              'bg-indigo-600': true,
              'text-white': true,
              'w-full': true,
            },
          }),
          h(
            'small',
            {
              class: 'text-sm',
            },
            'One or more comma separated list of positions',
          ),
        ],
      ),
    ],
  );
