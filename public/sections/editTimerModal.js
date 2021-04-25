import { h, text } from '../vendor/hyperapp.js';

import { handleKeydown } from '../lib/handleKeydown.js';

import { modal } from '../components/modal.js';
import { section } from '../components/section.js';
import { preventDefault } from '../lib/preventDefault.js';
import { button } from '../components/button.js';

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
      class: 'mb-2 block',
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

const group = (title, children) =>
  section({ class: 'mb-4' }, [
    h(
      'h4',
      {
        class: [
          'mb-2',
          'text-lg',
          'border-b border-gray-200 dark:border-gray-700',
          'text-black dark:text-white',
          'w-full',
        ],
      },
      text(title),
    ),
    ...children,
  ]);

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
  const isOwner = State.getIsOwner(state);
  // const { positions } = State.getShared(state);
  // const mobPositions = positions.split(',').concat('');
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

  return modal([
    h(
      'div',
      {
        class: ['mt-4 mb-2'],
      },
      [
        group('Timer Configuration', [
          h('label', { class: 'flex items-center justify-between mb-2' }, [
            h('div', { class: 'mr-2' }, text('Turn Duration')),
            input({ value: '5:00' }),
          ]),
          h('label', { class: 'flex items-center justify-between mb-2' }, [
            h('div', { class: 'mr-2' }, text('Positions')),
            input({ value: 'Navigator,Driver,Next' }),
          ]),
        ]),
        h(
          'div',
          {
            class: ['grid sm:grid-cols-2 gap-4 w-full'],
          },
          [
            group(
              'Participants',
              mob
                .concat(emptyParticipant)
                .map(participant(isEditable, isInMob)),
            ),
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
                  h('ul', { class: 'ml-4 text-gray-700 dark:text-gray-300' }, [
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
                  ]),
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
            h('input', { type: 'checkbox' }),
          ]),

          isOwner &&
            h('label', { class: 'flex items-center justify-between mb-2' }, [
              h('div', { class: 'mr-2' }, text('Saved YYYY-MM-DD HH:MM')),
              button(
                {
                  type: 'button',
                  color: 'gray',
                },
                text('Load'),
              ),
            ]),
        ]),
      ]),
    ]),
    h(
      'div',
      {
        class:
          'flex items-center justify-center pt-2 border-t border-gray-100 dark:border-gray-800 mb-1',
      },
      [
        button(
          { color: 'indigo', class: 'mr-2', size: 'md' },
          text('Save to browser'),
        ),
        button({ class: 'mr-2', size: 'md' }, text('Save as...')),
        h('div', { class: 'flex-grow' }),
        button(
          {
            size: 'md',
            onclick: preventDefault(() => [actions.SetModal, null]),
          },
          text('Close'),
        ),
      ],
    ),
  ]);
};
