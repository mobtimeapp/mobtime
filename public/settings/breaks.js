import { h } from '/vendor/hyperapp.js';

import { checkbox } from '/components/checkbox.js';

import { base } from '/settings/base.js';

export const breaks = () =>
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
          checked: false,
          inputProps: {
            readonly: true,
          },
        },
        h(
          'span',
          {
            class: 'text-4xl',
          },
          'Breaks are disabled',
        ),
      ),
    ],
  );
