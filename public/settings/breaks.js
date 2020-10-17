import { h } from '/vendor/hyperapp.js';

import { checkbox } from '/components/checkbox.js';
import { input } from '/components/input.js';

import { base } from '/settings/base.js';

import * as actions from '/actions.js';

import { getSettings } from '/settings/getSettings.js';
import { toMinutes } from '/lib/toMinutes.js';
import { toSeconds } from '/lib/toSeconds.js';

export const breaks = props => {
  const breaksEnabled = getSettings('breaksEnabled', props);
  return [
    h(
      base,
      {
        title: 'Breaks',
      },
      [
        h(
          checkbox,
          {
            id: 'breaks-enabled',
            checked: breaksEnabled,
            inputProps: {
              onchange: [
                actions.PendingSettingsSet,
                e => {
                  e.preventDefault();
                  return {
                    key: 'breaksEnabled',
                    value: e.target.checked,
                  };
                },
              ],
            },
          },
          [
            h(
              'span',
              {
                class: 'text-4xl',
                for: 'breaks-enabled',
              },
              `Breaks are ${breaksEnabled ? 'enabled' : 'disabled'}`,
            ),
          ],
        ),
      ],
    ),
    breaksEnabled &&
      h(
        base,
        {
          title: 'Time between breaks',
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
                name: 'setLength',
                maxlength: 2,
                pattern: '[1-9][0-9]?',
                value: toMinutes(getSettings('breakCadence', props)),
                oninput: [
                  actions.PendingSettingsSet,
                  e => ({
                    key: 'breakCadence',
                    value: toSeconds(e.target.value),
                  }),
                ],

                class: {
                  'text-4xl': true,
                  'font-extrabold': true,
                  'hover:border-indigo-300': true,
                  'hover:border-b-solid': true,
                  'bg-indigo-600': true,
                  'text-white': true,
                  'w-1/3': true,
                  'text-center': true,
                },
              }),
              h(
                'span',
                {
                  class: {
                    'mb-3': true,
                    'text-2xl': true,
                    'font-bold': true,
                    "uppercase": true,
                  },
                },
                'minutes',
              ),
            ],
          ),
        ],
      ),
  ];
};
