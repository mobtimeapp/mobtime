import { h, text } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { modal } from '/components/modal.js';
import { input } from '/components/input.js';
import { button } from '/components/button.js';

export const appPrompt = props =>
  modal(
    {
      ...props,
      cardClass: {
        'pb-4': true,
      },
    },
    [
      h(
        'form',
        {
          onsubmit: (_, e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            return [
              actions.PromptOK,
              {
                value: formData.get('value'),
              },
            ];
          },
        },
        [
          h(
            'label',
            {
              for: 'mobtime-prompt',
              class: {
                block: true,
                'mb-2': true,
              },
            },
            text(props.text),
          ),
          input({
            id: 'mobtime-prompt',
            name: 'value',
            value: props.value,
            oninput: (_, e) => [actions.PromptValueChange, e.target.value],
            autocomplete: 'off',
            class: {
              block: true,
              'mb-4': true,
            },
          }),
          h(
            'div',
            {
              class: {
                flex: true,
                'items-center': true,
                'justify-end': true,
              },
            },
            [
              button(
                {
                  onclick: actions.PromptCancel,
                },
                text('Cancel'),
              ),
              button(
                {
                  type: 'submit',
                  class: {
                    'bg-green-500': true,
                  },
                },
                text('Ok'),
              ),
            ],
          ),
        ],
      ),
    ],
  );
