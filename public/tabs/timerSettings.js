import { h, text } from '/vendor/hyperapp.js';

import { formattedTimeToMilliseconds } from '/lib/formatTime.js';
import { formData } from '/lib/form.js';

import * as actions from '/actions.js';

export const timerSettings = (props) => {
  const isDirty = (
    props.settings.duration !== formattedTimeToMilliseconds(props.forms.timerDuration.input) ||
    props.settings.mobOrder !== props.forms.mobOrder.input
  );

  return h('form', {
    onsubmit: (_, event) => {
      event.preventDefault();
      if (!event.target.reportValidity()) {
        return [s => s];
      }

      const settings = formData(event.target);
      settings.duration = formattedTimeToMilliseconds(settings.duration);

      return [actions.SubmitSettings, settings];
    },
  }, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Timer settings')),
      isDirty && h('button', {
        type: 'button',
        onclick: [actions.RevertSettings, {}],
        class: 'ml-1',
      }, text('Revert Changes')),
      isDirty && h('button', {
        type: 'submit',
        class: 'ml-1',
      }, text('Save')),
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
        h('div', {}, text('Duration')),
        h('div', { class: 'flex' }, [
          h('input', {
            type: 'text',
            pattern: '[0-9]{1,2}(:[0-5][0-9])?',
            class: [
              'mr-2 border-b border-slate-600 dark:bg-transparent dark:text-gray-200',
              !props.forms.timerDuration.valid && 'outline outline-red-400',
            ].filter(Boolean).join(' '),
            oninput: (_, event) => {
              const seconds = formattedTimeToMilliseconds(event.target.value) / 1000;
              const valid = event.target.checkValidity() && seconds > 0;

              return [actions.SetFormInput, { form: 'timerDuration', input: event.target.value, valid }];
            },
            placeholder: 'mm or mm:ss',
            value: props.forms.timerDuration.input,
            name: 'duration',
          }),
          text('minutes'),
        ]),

        h('div', {}, text('Positions')),
        h('div', { class: 'flex' }, [
          h('input', {
            type: 'text',
            pattern: '([^,]+,?)+',
            class: [
              'mr-2 border-b border-slate-600 dark:bg-transparent dark:text-gray-200 block w-full',
              !props.forms.mobOrder.valid && 'outline outline-red-400',
            ].filter(Boolean).join(' '),
            oninput: (_, event) => {
              return [actions.SetFormInput, { form: 'mobOrder', input: event.target.value, valid: true }];
            },
            placeholder: 'navigator,driver',
            value: props.forms.mobOrder.input,
            name: 'mobOrder',
            title: 'Comma separated list of position names',
          }),
        ]),
      ],
    ),
  ]);
};
