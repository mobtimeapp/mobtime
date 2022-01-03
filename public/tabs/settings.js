import * as actions from '/actions.js';
import { button } from '/components/button.js';
import { checkbox } from '/components/checkbox.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { h, text } from '/vendor/hyperapp.js';

const isNumber = value => Number(value) == value; // eslint-disable-line eqeqeq

const toMinutes = value => {
  if (value === '') return value;
  return isNumber(value) ? parseInt(value / 60000, 10) : value;
};

const toSeconds = value => {
  if (value === '') return value;
  return isNumber(value) ? value * 60000 : value;
};

const value = (key, { pendingSettings, settings }) =>
  key in pendingSettings ? pendingSettings[key] : settings[key];

export const settings = props =>
  h('div', {}, [
    overviewHeading(
      {
        rightAction:
          Object.keys(props.pendingSettings).length === 0
            ? h('div', {}, [
                text('Saved '),
                h('i', { class: 'fas fa-check text-green-500' }),
              ])
            : h('div', {}, [
                button(
                  {
                    class: {
                      'bg-indigo-500': true,
                      'hover:bg-indigo-400': true,
                      'text-white': true,
                      'mr-1': true,
                    },
                    onclick: actions.PendingSettingsReset,
                  },
                  text('Cancel'),
                ),
                button(
                  {
                    type: 'button',
                    class: {
                      'bg-green-600': true,
                      'hover:bg-green-500': true,
                      'text-white': true,
                    },
                    disable: Object.keys(props.pendingSettings).length === 0,
                    onclick: actions.UpdateSettings,
                  },
                  text('Save'),
                ),
              ]),
      },
      text('Shared Timer Settings'),
    ),

    section(
      {
        class: {
          "grid": true,
          'grid-cols-2': true,
          'gap-2': true,
        },
      },
      [
        h('div', {}, text('Turn Duration (minutes)')),
        input({
          name: 'setLength',
          maxlength: 2,
          pattern: '[1-9]{0,2}',
          value: toMinutes(value('duration', props)),
          oninput: (_, e) => {
            e.preventDefault();
            return [
              actions.PendingSettingsSet,
              {
                key: 'duration',
                value: toSeconds(e.target.value),
              },
            ];
          },

          class: {
            'hover:border-indigo-300': true,
            'hover:border-b-solid': true,
            'w-full': true,
          },
        }),

        h('div', {}, text('Mob Roles/Order')),
        h(
          'div',
          {
            class: {
              'w-full': true,
            },
          },
          [
            input({
              name: 'mobOrder',
              pattern: '^[^,].+[^,]$',
              value: value('mobOrder', props),
              oninput: (_, e) => [
                actions.PendingSettingsSet,
                {
                  key: 'mobOrder',
                  value: e.target.value,
                },
              ],

              class: {
                'hover:border-indigo-300': true,
                'hover:border-b-solid': true,
                'w-full': true,
              },
            }),
            h(
              'small',
              {
                class: 'text-sm',
              },
              text('One or more comma separated list of positions'),
            ),
          ],
        ),
      ],
    ),

    overviewHeading({}, text('Notifications')),

    section({}, [
      h(
        'div',
        {
          class: 'text-sm mb-2',
        },
        [
          checkbox(
            {
              id: 'enable-sound',
              checked: props.allowSound,
              inputProps: {
                onchange: (_, event) => [
                  actions.SetAllowSound,
                  event.target.checked,
                ],
              },
            },
            h('span', {}, text('Enable timer sounds')),
          ),
        ],
      ),
      h(
        'div',
        {
          class: 'text-xs mb-2 ml-10',
        },
        [
          text('Pneumatic horn sound provided by '),
          h(
            'a',
            {
              href:
                'https://bigsoundbank.com/detail-1828-pneumatic-horn-simple-2.html',
              target: '_blank',
            },
            text('bigsoundbank.com'),
          ),
        ],
      ),
      h(
        'div',
        {
          class: 'text-sm mb-2',
        },
        [
          checkbox(
            {
              id: 'enable-notifications',
              checked: props.allowNotification,
              inputProps: {
                onchange: (_, event) => [
                  actions.SetAllowNotification,
                  {
                    allowNotification: event.target.checked,
                    Notification: window.Notification,
                    documentElement: document,
                  },
                ],
              },
            },
            h('span', {}, text('Enable browser notifications')),
          ),
        ],
      ),
      !props.notificationPermissions ||
        (props.notificationPermissions === 'default' &&
          button(
            {
              class: {
                'text-md': true,
                'bg-green-500': true,
                'text-white': true,
                'flex-grow': true,
              },
              onclick: () => [
                actions.RequestNotificationPermission,
                {
                  Notification: window.Notification,
                  documentElement: document,
                },
              ],
            },
            text('Request notification permission'),
          )),
    ]),
  ]);
