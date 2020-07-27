import { h } from '/vendor/hyperapp.js';

import { input } from '/components/input.js';
import { base } from '/settings/base.js';

import * as actions from '/actions.js';

const isNumber = (value) => Number(value) == value; // eslint-disable-line eqeqeq

const toMinutes = (value) => (
  isNumber(value)
    ? parseInt((value - 900) / 60000, 10)
    : value
);

const toSeconds = (value) => (
  isNumber(value)
    ? (value * 60000) + 900
    : value
);

const value = (key, { pendingSettings, settings }) => (
  key in pendingSettings
    ? pendingSettings[key]
    : settings[key]
);

export const setLength = (props) => h(base, {
  title: 'Turn Duration',
}, [
  h(input, {
    name: 'setLength',
    maxlength: 2,
    pattern: '[1-9][0-9]?',
    value: toMinutes(value('duration', props)),
    oninput: [
      actions.PendingSettingsSet,
      (e) => ({
        key: 'duration',
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
  h('span', {
    class: {
      'mb-3': true,
      'text-2xl': true,
      'font-bold': true,
      'uppercase': true,
    },
  }, 'minutes'),
]);
