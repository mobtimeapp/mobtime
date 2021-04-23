import { h, text } from '../vendor/hyperapp.js';

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

const hidden = props =>
  h('input', {
    type: 'hidden',
    ...props,
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

const handleCtrlShift = keyActionMap => (state, event) => {
  if (event.repeat || (!event.ctrlKey && !event.shiftKey)) {
    return state;
  }
  console.log(event.key);
  const action = keyActionMap[event.key];
  if (!action) {
    return state;
  }
  event.preventDefault();
  return action(state, event);
};

const onKeyDown = (currentGoal, index) => (state, event) => {
  if (event.repeat || index === 0 || (!event.ctrlKey && !event.shiftKey))
    return state;

  if (event.key === 'Enter') {
    event.preventDefault();
    return actions.AddGoal(state, { text: '', parentId: currentGoal.id });
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    return actions.UpdateGoal(state, {
      ...currentGoal,
      parentId: null,
    });
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    if (!currentGoal.parentId) {
      const previousGoal = State.getGoals(state)[index - 1];
      const parentId = previousGoal.parentId || previousGoal.id;
      return actions.UpdateGoal(state, {
        ...currentGoal,
        parentId,
      });
    }
  }

  return state;
};

const goal = (currentGoal, index) => {
  return h(
    'fieldset',
    {
      class: 'mb-2 w-full',
      key: `goal-${index}`,
    },
    [
      hidden({ name: `goals[${index}][id]`, value: currentGoal.id }),
      h(
        'div',
        {
          class: [
            'flex items-start justify-start',
            currentGoal.parentId && 'pl-4',
          ],
        },
        [
          h('div', { class: 'w-4' }, [
            h('input', {
              type: 'checkbox',
              disabled: true,
              checked: currentGoal.completed,
              class: 'flex-shrink',
            }),
          ]),
          h('div', { class: 'flex-grow' }, [
            textarea({
              // class: ['w-full block'],
              rows: 1,
              placeholder: 'Add your goals...',
              name: `goals[${index}][text]`,
              value: currentGoal.text || '',
              oninput: preventDefault(e => [
                currentGoal.id ? actions.UpdateGoal : actions.AddGoal,
                { ...currentGoal, text: e.target.value },
              ]),
              onkeydown: handleCtrlShift({
                Enter: state =>
                  currentGoal.id
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
              }),
              onblur: preventDefault(() => [
                currentGoal.text ? s => s : actions.RemoveGoal,
                currentGoal,
              ]),
            }),
          ]),
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
          'text-white',
          'w-full',
        ],
      },
      text(title),
    ),
    ...children,
  ]);

export const editTimerModal = state => {
  const isOwner = State.getIsOwner(state);
  // const { positions } = State.getShared(state);
  // const mobPositions = positions.split(',').concat('');
  const mob = State.getMob(state);
  const emptyParticipant = {
    id: `anonymous_${Date.now()}`,
    name: '',
    avatar: '',
  };

  const isEditable = p => p.id.startsWith('anonymous_');
  const isInMob = p => mob.some(m => m.id === p.id);

  const currentGoals = State.getGoals(state);
  const lastGoal = currentGoals.slice(-1)[0] || {};
  const goals = currentGoals.concat({
    id: null,
    text: '',
    completed: false,
    parentId: lastGoal.parentId || null,
  });

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
            group('Goals', goals.map(goal)),
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
              h(
                'button',
                {
                  type: 'button',
                  class:
                    'px-2 py-1 border border-gray-100 dark:border-gray-800',
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
          { color: 'indigo', contrast: 1, class: 'mr-2', size: 'md' },
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
