import { h } from '/vendor/hyperapp.js';

import { button } from '/components/button.js';

import * as actions from '/actions.js';

const formDecoder = e => {
  e.preventDefault();
  return null;
};

export const settings = (props, children) =>
  h(
    'form',
    {
      ...props,
      action: '/api/settings',
      method: 'post',
      onsubmit: [actions.UpdateSettings, formDecoder],
    },
    [
      h('div', {}, children),
      Object.keys(props.pendingSettings).length > 0 &&
        h(
          'div',
          {
            class: {
              "grid": true,
              'gap-1': true,
              'grid-cols-2': true,
              'px-8': true,
              'mb-4': true,
            },
          },
          [
            h(
              button,
              {
                class: {
                  'bg-indigo-500': true,
                  'hover:bg-indigo-400': true,
                },
                onclick: actions.PendingSettingsReset,
              },
              'Cancel',
            ),
            h(
              button,
              {
                type: 'submit',
                class: {
                  'bg-green-600': true,
                  'hover:bg-green-500': true,
                },
                disable: Object.keys(props.pendingSettings).length === 0,
              },
              'Save',
            ),
          ],
        ),
      Object.keys(props.pendingSettings).length === 0 &&
        h(
          'div',
          {
            class: {
              'text-center': true,
            },
          },
          ['Settings are up to date ', h('i', { class: 'fas fa-check' })],
        ),
    ],
  );
