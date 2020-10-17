import { h } from '/vendor/hyperapp.js';

import { checkbox } from '/components/checkbox.js';

import { base } from '/settings/base.js';

import * as actions from '/actions.js';

import { getSettings } from '/settings/getSettings.js';

export const breaks = props => {
  const breaksEnabled = getSettings('breaksEnabled', props);
  return h(
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
        h(
          'span',
          {
            class: 'text-4xl',
          },
          `Breaks are ${breaksEnabled ? 'enabled' : 'disabled'}`,
        ),
      ),
    ],
  );
};
