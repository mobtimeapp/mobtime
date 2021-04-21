import { h, text } from '../vendor/hyperapp.js';

import { modal } from '../components/modal.js';
import { section } from '../components/section.js';
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
          'px-2',
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

const hidden = props =>
  h('input', {
    type: 'hidden',
    ...props,
  });

const participant = isEditable => ({ id, name, avatar, position }, index) => {
  const namePrefix = `mob[${index}]`;
  const inputName = field => `${namePrefix}[${field}]`;
  return h(
    'fieldset',
    {
      class: 'mb-2',
      key: `participant-${id}-${name}`,
    },
    [
      hidden({ name: inputName('id'), value: id || '' }),
      hidden({ name: inputName('avatar'), value: avatar || '' }),
      typeof position === 'string' &&
        input({
          name: 'positions[]',
          value: position,
          placeholder: 'Position',
          class: ['uppercase text-sm tracking-widest'],
          onchange: preventDefault(event => {
            const formData = new FormData(event.target.form);
            const positions = formData
              .getAll('positions[]')
              .filter(p => p)
              .join(',');
            return [actions.UpdatePositions, positions];
          }),
        }),
      typeof position !== 'string' &&
        h(
          'div',
          {
            class:
              'px-1 uppercase text-sm tracking-widest text-gray-200 dark:text-gray-700',
          },
          text('Bench'),
        ),
      input({
        name: inputName('name'),
        readonly: !isEditable({ id, name, avatar }),
        value: name || '',
        placeholder: 'Participant name',
        onchange: preventDefault(event => {
          const formData = new FormData(event.target.form);
          const data = Object.fromEntries(formData.entries());
          const anonymous = Object.keys(data).reduce((memo, key) => {
            if (!key.startsWith(namePrefix)) return memo;
            const cleanKey = key
              .replace(namePrefix, '')
              .replace(/[^A-Za-z0-9_]/g, '');
            return { ...memo, [cleanKey]: data[key] };
          }, {});

          const defaultAction = anonymous.name
            ? actions.UpdateAnonymousInMob
            : actions.RemoveFromMob;
          const action =
            !anonymous.id && anonymous.name
              ? actions.AddAnonymousToMob
              : defaultAction;

          anonymous.id = anonymous.id || Date.now();

          return [action, anonymous];
        }),
      }),
    ],
  );
};

const onKeyDown = (currentGoal, index) => (state, event) => {
  if (index === 0) return state;

  if (currentGoal.parentId && event.shiftKey && event.key === 'Tab') {
    return actions.SetParentOfGoal(state, {
      goal: currentGoal,
      parent: null,
    });
  }
  if (!currentGoal.parentId && event.key === 'Tab') {
    const previousGoal = State.getGoals(state)[index - 1];
    return actions.SetParentOfGoal(state, {
      goal: currentGoal,
      parent: previousGoal,
    });
  }
};

const goal = ({ id, text: goalText, completed }, index) => {
  return h(
    'fieldset',
    {
      class: 'mb-2',
      key: `participant-${id}-${goalText}`,
    },
    [
      hidden({ name: `goals[${index}][id]`, value: id }),
      h(
        'div',
        {
          class: 'flex items-start justify-start',
        },
        [h('textarea', { placeholder: 'Enter your goal' })],
      ),
    ],
  );
};

const group = (title, children) =>
  section({}, [
    h(
      'h4',
      {
        class: [
          'mb-4',
          'text-lg',
          'border-b border-gray-100 dark:border-gray-800',
        ],
      },
      text(title),
    ),
    ...children,
  ]);

export const editTimerModal = state => {
  const isOwner = State.getIsOwner(state);
  const { positions } = State.getShared(state);
  const mobPositions = positions.split(',').concat('');
  const currentMob = State.getMob(state);
  const emptyParticipant = { id: null, name: null, avatar: null };

  const mob = Array.from(
    {
      length: Math.max(mobPositions.length, currentMob.length),
    },
    (_, index) => {
      const member = currentMob[index] || emptyParticipant;
      return { ...member, position: mobPositions[index] };
    },
  );
  const anyEmpty = mob.some(m => !m.id && !m.name && !m.avatar && !m.position);
  if (!anyEmpty) {
    mob.push(emptyParticipant);
  }

  const isEditable = p => State.isParticipantEditable(state, p);

  const goals = State.getGoals(state).concat({
    id: null,
    text: '',
    completed: false,
  });

  return modal([
    h(
      'form',
      {
        class: ['mt-4 px-2 pb-2'],
        onsubmit: preventDefault(() => [s => s]),
        autocomplete: 'off',
      },
      [
        isOwner &&
          h(
            'p',
            {},
            text(
              `You are the timer owner, which gives you much more control over what can be changed.`,
            ),
          ),
        h(
          'div',
          {
            class: ['grid sm:grid-cols-2 gap-4'],
          },
          [
            group('Participants', mob.map(participant(isEditable, isOwner))),
            group('Goals', goals.map(goal)),
          ],
        ),
      ],
    ),
  ]);
};
