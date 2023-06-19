import { h, text } from '/vendor/hyperapp.js';

import { formattedTimeToMilliseconds } from '/lib/formatTime.js';
import { formData } from '/lib/form.js';

import * as actions from '/actions.js';

export const timerSettings = (props) => {
  const isDirty = (
    props.settings.duration !== formattedTimeToMilliseconds(props.forms.timerDuration.input)
  );

  return h('form', {
    onsubmit: (_, event) => {
      event.preventDefault();

      if (!event.target.reportValidity()) {
        console.log('skipping submit, form invalid');
        return [s => s];
      }

      const settings = formData(event.target);
      settings.duration = formattedTimeToMilliseconds(settings.duration);

      console.log('form.submit', settings, event.target);

      return [actions.SubmitSettings, settings];
    },
  }, [
    h('header', { class: 'flex justify-start items-center border-b border-gray-400 mb-2' }, [
      h('h1', { class: 'text-lg font-bold flex-grow' }, text('Timer settings')),
      isDirty && h('button', {
        type: 'button',
      }, text('Revert Changes')),
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
              console.log('settings.change', event.target.value, formattedTimeToMilliseconds(event.target.value));
              // let [minutes, seconds] = event.target.value.split(':');
              // minutes ||= 0;
              // seconds = (seconds || 0) + (minutes * 60);
              const valid = event.target.checkValidity() && seconds > 0;

              return [actions.SetFormInput, { form: 'timerDuration', input: event.target.value, valid }];
            },
            placeholder: 'mm or mm:ss',
            value: props.forms.timerDuration.input,
            name: 'duration',
          }),
          text('minutes'),
        ]),
      ],
    ),
  ]);
};
