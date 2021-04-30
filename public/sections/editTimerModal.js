import { h, text } from '../vendor/hyperapp.js';

import { handleKeydown } from '../lib/handleKeydown.js';
import { formatTime } from '../lib/formatTime.js';

import { modal } from '../components/modal.js';
import { group } from '../components/group.js';
import { button } from '../components/button.js';
import { preventDefault } from '../lib/preventDefault.js';

import * as State from '../state.js';
import * as actions from '../actions.js';

const input = props =>
  h(
    'div',
    {
      class: 'flex items-center justify-start',
    },
    [
      h('input', {
        type: 'text',
        autocomplete: 'off',
        ...props,
        class: [
          'block',
          'w-64 max-w-full',
          'border-b border-gray-200 dark:border-gray-700',
          'invalid:border-red-600 dark:invalid:border-red-600',
          'px-2',
          'bg-transparent',
          ...(props.class || []),
        ],
      }),
      h(
        'div',
        {
          class: 'flex-shrink w-8',
        },
        text(props.readonly ? '🔏' : ' '),
      ),
    ],
  );

const textarea = props =>
  h('textarea', {
    autocomplete: 'off',
    ...props,
    class: [
      'block',
      'border-b border-gray-200 dark:border-gray-700',
      'px-2',
      'resize-y',
      'bg-transparent',
      ...(props.class || []),
    ],
  });

const participant = (isEditable, isInMob) => currentParticipant => {
  return h(
    'fieldset',
    {
      class: 'mb-2 block flex items-center justify-start',
      key: `participant-${currentParticipant.id}`,
    },
    [
      input({
        readonly: !isEditable(currentParticipant),
        value: currentParticipant.name || '',
        placeholder: 'Participant name',
        oninput: preventDefault(event => [
          isInMob(currentParticipant)
            ? actions.UpdateAnonymousInMob
            : actions.AddAnonymousToMob,
          { ...currentParticipant, name: event.target.value },
        ]),
        onblur: preventDefault(() => [
          !currentParticipant.name ? actions.RemoveFromMob : s => s,
          currentParticipant,
        ]),
      }),
      isInMob(currentParticipant) &&
        button(
          {
            size: 'sm',
            onclick: preventDefault(() => [
              actions.RemoveFromMob,
              currentParticipant,
            ]),
          },
          text('🗑️'),
        ),
    ],
  );
};

const ctrlShiftAcceptance = event =>
  !event.repeat && event.ctrlKey && event.shiftKey;

const goal = isInGoals => (currentGoal, index) => {
  return h(
    'fieldset',
    {
      class: 'mb-2 w-full',
      key: `goal-${index}-${currentGoal.id}`,
    },
    [
      h(
        'div',
        {
          class: [currentGoal.parentId && 'pl-4'],
        },
        [
          textarea({
            // class: ['w-full block'],
            "class": [
              currentGoal.completed &&
                'line-through text-gray-400 dark:text-gray-600',
            ],
            "rows": 1,
            "placeholder": 'Add your goals...',
            "value": currentGoal.text || '',
            'data-goal-id': currentGoal.id,
            "oninput": preventDefault(e => [
              isInGoals(currentGoal) ? actions.UpdateGoal : actions.AddGoal,
              { ...currentGoal, text: e.target.value },
            ]),
            "onkeydown": handleKeydown(ctrlShiftAcceptance, {
              Enter: state =>
                isInGoals(currentGoal)
                  ? actions.AddGoal(state, {
                      text: '',
                      parentId: currentGoal.parentId || currentGoal.id,
                    })
                  : state,
              ArrowLeft: state =>
                actions.UpdateGoal(state, { ...currentGoal, parentId: null }),
              ArrowRight: state => {
                const previousGoal = State.getGoals(state)[index - 1];
                if (currentGoal.parentId || !previousGoal) {
                  return state;
                }
                const parentId = previousGoal.parentId || previousGoal.id;
                return actions.UpdateGoal(state, {
                  ...currentGoal,
                  parentId,
                });
              },
              ArrowUp: state =>
                actions.MoveGoal(state, { goal: currentGoal, direction: -1 }),
              ArrowDown: state =>
                actions.MoveGoal(state, { goal: currentGoal, direction: 1 }),
            }),
            "onblur": preventDefault(() => [
              currentGoal.text ? s => s : actions.RemoveGoal,
              currentGoal,
            ]),
          }),
        ],
      ),
    ],
  );
};

const shortcut = (keyCombination, description) =>
  h('div', {}, [
    h(
      'strong',
      { class: 'block sm:inline sm:mr-2 text-black dark:text-white' },
      text(keyCombination),
    ),
    text(description),
  ]);

export const editTimerModal = state => {
  const profile = State.getProfile(state);
  const { duration, positions } = State.getShared(state);
  const mob = State.getMob(state);
  const emptyParticipant = {
    id: `anonymous_${Math.random()
      .toString(36)
      .slice(2)}`,
    name: '',
    avatar: '',
  };

  const isEditable = p => p.id.startsWith('anonymous_');
  const isInMob = p => mob.some(m => m.id === p.id);

  const goals = State.getGoals(state);
  const lastGoal = goals.slice(-1)[0] || {};
  const emptyGoal = {
    id: Math.random()
      .toString(36)
      .slice(2),
    text: '',
    completed: false,
    parentId: lastGoal.parentId || null,
  };
  const isInGoals = g => goals.some(({ id }) => g.id === id);

  const selfInMob = mob.some(m => m.id === profile.id);

  return modal(
    {
      left: [
        {
          smText: 'Save',
          text: 'Save to Browser',
          color: 'indigo',
          action: [actions.SaveTimer],
        },
        {
          smText: 'Load',
          text: 'Load from Browser',
          color: 'blue',
          action: [actions.LoadTimer],
        },
      ],
      right: [{ text: 'Close', action: [actions.SetModal, null] }],
    },
    [
      h(
        'div',
        {
          class: 'mt-4 mb-2 w-full',
        },
        [
          group('Timer Configuration', [
            h('label', { class: 'flex items-center justify-between mb-2' }, [
              h('div', { class: 'mr-2' }, text('Turn Duration')),
              input({
                value: formatTime(duration).replace(/^0/, ''),
                placeholder: 'mm:ss',
                title: 'Duration formatted as m:ss or mm:ss',
                oninput: preventDefault(({ target }) => {
                  const format = /\d{1,2}:\d{2}/;
                  if (!format.test(target.value)) {
                    target.setCustomValidity(
                      'Duration must by in the format of m:ss or mm:ss',
                    );
                    target.reportValidity();
                    return [s => s];
                  }
                  const [minutes, seconds] = target.value
                    .split(':')
                    .map(v => parseInt(v.replace(/^0/, ''), 10));
                  const milliseconds = (minutes * 60 + seconds) * 1000 + 999;
                  target.setCustomValidity('');
                  target.reportValidity();
                  return [actions.UpdateSettings, { duration: milliseconds }];
                }),
              }),
            ]),
            h('label', { class: 'flex items-center justify-between mb-2' }, [
              h('div', { class: 'mr-2' }, text('Positions')),
              input({
                value: positions,
                oninput: preventDefault(({ target }) => [
                  actions.UpdateSettings,
                  { positions: target.value },
                ]),
              }),
            ]),
          ]),
          h(
            'div',
            {
              class: ['grid sm:grid-cols-2 gap-4 w-full'],
            },
            [
              group('Participants', [
                h(
                  'div',
                  {},
                  mob
                    .concat(emptyParticipant)
                    .map(participant(isEditable, isInMob)),
                ),
                h('div', { class: 'flex items-center justify-start' }, [
                  !selfInMob &&
                    button(
                      {
                        onclick: preventDefault(() => [actions.AddMeToMob]),
                        class: 'mr-1',
                      },
                      text('Add yourself'),
                    ),
                  mob.length > 2 &&
                    button(
                      {
                        onclick: preventDefault(() => [actions.ShuffleMob]),
                        class: 'mr-1',
                      },
                      text('Shuffle'),
                    ),
                  mob.length > 1 &&
                    button(
                      {
                        onclick: preventDefault(() => [actions.CycleMob]),
                        class: 'mr-1',
                      },
                      text('Cycle'),
                    ),
                ]),
              ]),
              group('Goals', [
                h(
                  'div',
                  { class: 'mb-4' },
                  goals.concat(emptyGoal).map(goal(isInGoals)),
                ),
                h(
                  'details',
                  {
                    class: ['text-sm', 'mb-4'],
                  },
                  [
                    h(
                      'summary',
                      { class: 'text-gray-400 dark:text-gray-600' },
                      text('Keyboard controls'),
                    ),
                    h(
                      'ul',
                      { class: 'ml-4 text-gray-700 dark:text-gray-300' },
                      [
                        h(
                          'li',
                          {},
                          shortcut('Ctrl+Shift+Enter', 'Add a child goal'),
                        ),
                        h(
                          'li',
                          {},
                          shortcut(
                            'Ctrl+Shift+Right Arrow',
                            'Make this goal a child goal',
                          ),
                        ),
                        h(
                          'li',
                          {},
                          shortcut(
                            'Ctrl+Shift+Left Arrow',
                            'Make this goal a top-level goal',
                          ),
                        ),
                        h(
                          'li',
                          {},
                          shortcut('Ctrl+Shift+Up Arrow', 'Move goal up'),
                        ),
                        h(
                          'li',
                          {},
                          shortcut('Ctrl+Shift+Down Arrow', 'Move goal down'),
                        ),
                      ],
                    ),
                  ],
                ),
              ]),
            ],
          ),
        ],
      ),

      group('Session Persistance', [
        h('div', { class: 'grid sm:grid-cols-2 gap-4' }, [
          h('div', {}, [
            h('label', { class: 'flex items-center justify-between mb-2' }, [
              h('div', { class: 'mr-2' }, text('Auto-save timer session')),
              h('input', {
                type: 'checkbox',
                checked: State.isLocalAutoSaveTimer(state),
                oninput: preventDefault(event => [
                  actions.AutoSaveTimer,
                  event.target.checked,
                ]),
              }),
            ]),
          ]),
        ]),
      ]),
    ],
  );
};
