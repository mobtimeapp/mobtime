import { h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

import { modal } from '/components/modal.js';
import { input } from '/components/input.js';
import { button } from '/components/button.js';

export const appPrompt = props =>
  h(
    modal,
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
                "block": true,
                'text-extrabold': true,
                'text-2xl': true,
                'mb-2': true,
              },
            },
            props.text,
          ),
          h(input, {
            id: 'mobtime-prompt',
            name: 'value',
            value: props.value,
            oninput: [actions.PromptValueChange, e => e.target.value],
            autocomplete: 'off',
            class: {
              "block": true,
              'bg-indigo-500': true,
              'text-3xl': true,
              'mb-4': true,
            },
          }),
          h(
            'div',
            {
              class: {
                "flex": true,
                'items-center': true,
                'justify-end': true,
              },
            },
            [
              h(
                button,
                {
                  onclick: actions.PromptCancel,
                },
                'Cancel',
              ),
              h(
                button,
                {
                  type: 'submit',
                  class: {
                    'bg-green-500': true,
                  },
                },
                'Ok',
              ),
            ],
          ),
        ],
      ),
    ],
  );
