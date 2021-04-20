import { h, text } from '../vendor/hyperapp.js';

import { modal } from '../components/modal.js';
import { column } from '../components/column.js';
import { participant } from '../components/participant.js';
import { preventDefault, withDefault } from '../lib/preventDefault.js';

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

const setting = (label, inputProps, actionButtons = []) =>
  h(
    'div',
    {
      class: [
        'grid grid-cols-3',
        'px-1 py-2 mb-2',
        'border-b border-gray-100 dark:border-gray-800',
      ],
    },
    [
      h('label', { for: labelToId(label) }, text(label)),
      h('div', { class: 'flex w-full items-center justify-end col-span-2' }, [
        h('input', {
          type: 'text',
          id: labelToId(label),
          name: label,
          ...inputProps,
        }),
      ]),
      actionButtons.length > 0 &&
        h(
          'div',
          {
            class: 'col-span-2 my-2 flex items-center justify-between',
          },
          [...actionButtons.map(action => button(action.text, {}))],
        ),
    ],
  );

const textInputProps = props => ({
  class: [
    'w-full',
    'flex-stretch',
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

const avatarPreview = (profile, avatar, title) => {
  const isSelected = profile.avatar === avatar;

  return h('li', { class: 'mb-4' }, [
    h('label', { class: 'flex items-center justify-center' }, [
      h('input', {
        type: 'radio',
        name: 'avatar',
        value: avatar,
        class: 'mr-2',
        oninput: withDefault(event => [
          actions.UpdateProfile,
          { avatar: event.target.value },
        ]),
        checked: isSelected,
      }),

      h('div', { class: 'flex-grow' }, [
        participant({
          ...profile,
          avatar,
          position: title || 'Untitled GIFY',
        }),
      ]),
    ]),
  ]);
};

export const profileModal = state => {
  const profile = State.getProfile(state);
  const { giphyResults } = State.getLocal(state);

  return modal([
    h(
      'form',
      {
        class: 'mt-4 px-2 pb-2',
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

          h(
            'ul',
            {
              class: 'w-3/4 mx-auto grid grid-cols-2 gap-4',
            },
            [
              h('li', { class: 'col-span-2' }, [
                h('input', {
                  type: 'text',
                  placeholder: 'Search avatars, Powered by GIPHY',
                  class: [
                    'w-full',
                    'flex-stretch',
                    'p-1 mb-1',
                    'bg-gray-100 dark:bg-gray-800',
                    'border-b border-gray-900 dark:border-gray-200',
                  ],
                  onchange: preventDefault(event => [
                    actions.ProfileModalGiphySearch,
                    event.target.value,
                  ]),
                }),
              ]),
              ...giphyResults.map(({ url, title }) =>
                avatarPreview(profile, url, title),
              ),

              avatarPreview(profile, null, 'No Avatar'),
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
              onclick: preventDefault(() => [actions.ResetProfile]),
            }),
            h('div', { class: 'flex-grow' }),
            button('Cancel', {
              onclick: preventDefault(() => [actions.SetModal, null]),
            }),
            button('Save', { type: 'submit' }),
          ],
        ),
      ],
    ),
  ]);
};
