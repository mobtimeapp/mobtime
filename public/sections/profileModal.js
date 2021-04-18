import { h, text } from '/vendor/hyperapp.js';

import { modal } from '../components/modal.js';
import { column } from '../components/column.js';
import { participant } from '../components/participant.js';

const labelToId = label =>
  label
    .replace(/[^A-Za-z]/g, '_')
    .replace(/__/g, '_')
    .toLowerCase();

const button = (label, props) =>
  h(
    'button',
    {
      type: 'button',
      ...props,
      class: [
        'text-sm',
        'p-2 mr-1',
        'shadow-sm rounded',
        'bg-gray-200 dark:bg-gray-700',
        ...(props.class || []),
      ],
    },
    text(label),
  );

const setting = (label, inputProps, actions = []) =>
  h(
    'div',
    {
      class: [
        'grid grid-cols-2',
        'px-1 py-2 mb-2',
        'border-b border-gray-100 dark:border-gray-600',
      ],
    },
    [
      h('label', { for: labelToId(label) }, text(label)),
      h('div', { class: 'text-right' }, [
        h('input', {
          type: 'text',
          id: labelToId(label),
          name: label,
          class: 'text-left',
          ...inputProps,
        }),
      ]),
      actions.length > 0 &&
        h(
          'div',
          {
            class: 'col-span-2 my-2 flex items-center justify-between',
          },
          [...actions.map(action => button(action.text, {}))],
        ),
    ],
  );

const textInputProps = props => ({
  class: [
    'p-1 mb-1',
    'bg-gray-100 dark:bg-gray-800',
    'border-b border-gray-900 dark:border-gray-200',
  ],
  ...props,
  type: 'text',
});

const checkboxProps = props => ({
  ...props,
  type: 'checkbox',
});

const group = (title, children) =>
  h(
    'div',
    {
      class: 'mb-8',
    },
    column(title, children),
  );

export const profileModal = state =>
  modal([
    h(
      'form',
      {
        class: 'mt-4',
      },
      [
        group('Profile Settings', [
          setting('Name', textInputProps({})),
          setting('Avatar', textInputProps({})),

          h(
            'ul',
            {
              class: 'w-3/4 mx-auto',
            },
            [
              participant({
                name: 'Test',
                avatar: '',
                position: 'Preview',
              }),
            ],
          ),
        ]),

        group('Application Settings', [
          setting('Enable sounds', checkboxProps({}), [{ text: 'Play Sound' }]),
          setting('Enable browser notifications', checkboxProps({}), [
            { text: 'Test Notification' },
          ]),
        ]),

        h(
          'div',
          {
            class: 'flex items-center justify-center',
          },
          [
            button('Delete Profile', {
              class: ['bg-red-600 dark:bg-red-800 text-gray-100'],
            }),
            h('div', { class: 'flex-grow' }),
            button('Cancel', {}),
            button('Save', {}),
          ],
        ),
      ],
    ),
  ]);
