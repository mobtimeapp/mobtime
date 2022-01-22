import * as actions from '/actions.js';
import { button } from '/components/button.js';
import { checkbox } from '/components/checkbox.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { TestSound, SetSound } from '/actions.js';
import { toggleDarkMode } from '/effects.js';
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

const audioFiles = [
  { value: 'horn', label: 'Pneumatic horn' },
  { value: 'ding', label: 'Ding' },
  { value: 'applause', label: 'Applause and Cheering' },
  { value: 'bike-bell', label: 'Bike Bell' },
  { value: 'gong', label: 'Gong' },
  { value: 'excuse-me', label: 'Oops, excuse me' },
];

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
          grid: true,
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

    overviewHeading({}, text('Local Settings')),

    section({}, [
      h(
        'div',
        {
          class: 'text-sm mb-2 flex align-center justify-start',
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
            h(
              'select',
              {
                id: 'sound',
                class: {
                  'bg-white': true,
                  'text-black': true,
                  'dark:bg-gray-700': true,
                  'dark:text-gray-200': true,
                  'p-1': true,
                  'border-b': true,
                  'rounded-none': true,
                },
                disabled: !props.allowSound,
                onchange: (_, event) => [SetSound, event.target.value],
              },
              props.allowSound
                ? audioFiles.map(({ value, label }) =>
                    h(
                      'option',
                      { value, selected: props.sound === value },
                      text(label),
                    ),
                  )
                : [h('option', {}, text('Enable timer sounds'))],
            ),
          ),
          props.allowSound &&
            button({ onclick: () => [TestSound, {}] }, text('Test')),
        ],
      ),
      h(
        'div',
        {
          class: 'text-xs mb-2 ml-10',
        },
        [
          text('Sounds provided by '),
          h(
            'a',
            {
              href: 'https://bigsoundbank.com',
              target: '_blank',
              class: 'underline',
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
      h(
        'div',
        {
          class: 'text-sm mb-2',
        },
        [
          checkbox(
            {
              id: 'theme-darkmode',
              checked: props.dark,
              inputProps: {
                onchange: (_, event) => [
                  actions.SetDark,
                  { dark: event.target.checked },
                ],
              },
            },
            h('span', {}, text('Enable dark mode')),
          ),
        ],
      ),
    ]),
  ]);
