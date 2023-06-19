import { h, text } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

const audioFiles = [
  { value: 'horn', label: 'Pneumatic horn' },
  { value: 'ding', label: 'Ding' },
  { value: 'applause', label: 'Applause and Cheering' },
  { value: 'bike-bell', label: 'Bike Bell' },
  { value: 'gong', label: 'Gong' },
  { value: 'excuse-me', label: 'Oops, excuse me' },
];

export const localSettings = (props) => {
  return h('div', {}, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Local settings')),
      // h('button', {
      //   type: 'button',
      //   class: 'ml-2 dark:text-white text-black underline',
      //   onclick: actions.ShuffleMob,
      // }, text('Shuffle')),
      // h('button', {
      //   type: 'button',
      //   class: 'ml-2 dark:text-white text-black underline',
      //   onclick: actions.CycleMob,
      // }, text('Rotate')),
    ]),
    h(
      'div',
      {
        class: 'grid gap-2',
        style: {
          'grid-template-columns': '3fr 1fr',
        },
      },
      [
        h('div', {}, text('Dark mode')),
        h('input', {
          type: 'checkbox',
          checked: props.dark,
          oninput: (_, e) => [actions.SetDark, { dark: e.target.checked }],
        }),

        h('div', { class: 'flex items-bottom justify-between' }, [
          text('Notifications'),
          h('button', { type: 'button', class: 'px-2', onclick: () => [actions.TestNotification, {}] }, text('Test')),
        ]),
        h('input', {
          type: 'checkbox',
          checked: props.allowNotification,
          oninput: (_, e) => (
            e.target.checked
              ? [actions.RequestNotificationPermission, {}]
              : [actions.SetAllowNotification, { allowNotification: e.target.checked }]
          ),
        }),

        h('div', { class: 'flex items-bottom justify-between' }, [
          text('Timer Sound'),
          h('div', { class: 'flex-grow flex items-center justify-end' }, [
            h('select', {
              class: 'px-2 text-black',
              onchange: (_, event) => {
                return [actions.SetSound, event.target.value];
              },
            }, audioFiles.map(a => h(
              'option',
              { value: a.value },
              text(a.label),
            ))),
          ]),
          h('button', { type: 'button', class: 'px-2', onclick: [actions.TestSound, undefined] }, text('Test')),
        ]),
        h('input', {
          type: 'checkbox',
          checked: props.allowSound,
          oninput: (_, e) => [actions.SetAllowSound, e.target.checked],
        }),
      ],
    ),
  ]);
};
