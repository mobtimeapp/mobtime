import { h, text } from '../vendor/hyperapp.js';

import { modal } from '../components/modal.js';
import { column } from '../components/column.js';
import { participant } from '../components/participant.js';
import { preventDefault } from '../lib/preventDefault.js';

import * as State from '../state.js';
import * as actions from '../actions.js';

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
        'border-b border-gray-100 dark:border-gray-800',
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
  oninput: preventDefault(event => [
    actions.UpdateProfile,
    { [props.name]: event.target.value },
  ]),
});

const checkboxProps = props => ({
  ...props,
  type: 'checkbox',
  oninput: preventDefault(event => [
    actions.UpdateProfile,
    { [props.name]: event.target.checked },
  ]),
});

const hidden = (name, value) =>
  h('input', {
    type: 'hidden',
    name,
    value,
  });

const group = (title, children) =>
  h(
    'div',
    {
      class: 'mb-8',
    },
    column(title, children),
  );

export const profileModal = state => {
  const profile = State.getProfile(state);

  return modal([
    h(
      'form',
      {
        class: 'mt-4',
        onsubmit: preventDefault(() => [actions.SaveProfile]),
      },
      [
        hidden('id', profile.id),
        group('Profile Settings', [
          setting(
            'Name',
            textInputProps({
              name: 'name',
              value: profile.name,
            }),
          ),
          setting(
            'Avatar',
            textInputProps({
              name: 'avatar',
              value: profile.avatar,
            }),
          ),

          h(
            'ul',
            {
              class: 'w-3/4 mx-auto',
            },
            [
              participant({
                ...profile,
                position: 'Preview',
              }),
            ],
          ),
        ]),

        group('Application Settings', [
          setting(
            'Enable sounds',
            checkboxProps({
              name: 'enableSounds',
              value: 1,
              checked: !!profile.enableSounds,
            }),
            [{ text: 'Play Sound' }],
          ),
          setting(
            'Enable browser notifications',
            checkboxProps({
              name: 'enableNotifications',
              value: 1,
              checked: !!profile.enableNotifications,
            }),
            [{ text: 'Test Notification' }],
          ),
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
            button('Save', { type: 'submit' }),
          ],
        ),
      ],
    ),
  ]);
};
