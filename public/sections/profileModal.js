import { h, text } from '../vendor/hyperapp.js';

import { handleKeydown } from '../lib/handleKeydown.js';

import { modal } from '../components/modal.js';
import { group } from '../components/group.js';
import { participant } from '../components/participant.js';
import { preventDefault, withDefault } from '../lib/preventDefault.js';
import { button } from '../components/button.js';

import * as State from '../state.js';
import * as actions from '../actions.js';

const labelToId = label =>
  label
    .replace(/[^A-Za-z]/g, '_')
    .replace(/__/g, '_')
    .toLowerCase();

const setting = (label, inputProps, actionButtons = [], border = true) =>
  h(
    'div',
    {
      class: [
        'grid grid-cols-3',
        'px-1 py-2 mb-2',
        border && 'border-b border-gray-100 dark:border-gray-800',
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
            class: 'col-span-2 my-2 flex items-center justify-start',
          },
          [
            ...actionButtons.map(action =>
              button(
                {
                  size: 'md',
                  color: 'gray',
                  class: 'mr-2',
                  onclick: preventDefault(() => action.onclick),
                },
                text(action.text),
              ),
            ),
          ],
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

  return modal(
    {
      left: [
        {
          smText: 'Delete',
          text: 'Reset Profile',
          color: 'red',
          action: [actions.ResetProfile],
        },
      ],
      right: [
        { text: 'Cancel', action: [actions.SetModal, null] },
        { text: 'Save', action: [actions.SaveProfile] },
      ],
    },
    [
      h(
        'div',
        {
          class: 'mt-4 mb-2',
        },
        [
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
                class: 'w-3/4 mx-auto grid sm:grid-cols-2 gap-4',
              },
              [
                h('li', { class: 'sm:col-span-2' }, [
                  h('input', {
                    type: 'text',
                    placeholder: 'Search avatars, Powered by GIPHY',
                    class: [
                      'w-full',
                      'flex-stretch',
                      'p-1',
                      'bg-gray-100 dark:bg-gray-800',
                      'border-b border-gray-900 dark:border-gray-200',
                    ],
                    onkeydown: handleKeydown(e => !e.repeat, {
                      Enter: (s, e) =>
                        actions.ProfileModalGiphySearch(s, e.target.value),
                    }),
                    onblur: preventDefault(event => [
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
                oninput: preventDefault(e => [
                  actions.UpdateProfile,
                  { enableSounds: e.target.checked },
                ]),
              }),
              [{ text: 'Play Sound', onclick: [actions.PlayHonk] }],
            ),
            setting(
              'Enable browser notifications',
              checkboxProps({
                name: 'enableNotifications',
                value: 1,
                checked: !!profile.enableNotifications,
                oninput: preventDefault(e => [
                  actions.UpdateProfile,
                  { enableNotifications: e.target.checked },
                ]),
              }),
              [
                profile.enableNotifications && {
                  text: 'Request Permission',
                  onclick: [actions.PermitNotify],
                },
                {
                  text: 'Test',
                  onclick: [
                    actions.Notify,
                    { title: 'mobti.me test', text: 'Here is a notification' },
                  ],
                },
              ].filter(a => a),
              false,
            ),
          ]),
        ],
      ),
    ],
  );
};
