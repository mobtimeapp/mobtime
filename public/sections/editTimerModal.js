import { h, text } from '../vendor/hyperapp.js';

import { handleKeydown } from '../lib/handleKeydown.js';
import { formatTime } from '../lib/formatTime.js';

import { modal } from '../components/modal.js';
import { group } from '../components/group.js';
import { button } from '../components/button.js';
import { textarea, input } from '../components/form.js';
import { preventDefault } from '../lib/preventDefault.js';
import { withEvent, reactions } from '../lib/withEvent.js';

import * as State from '../state.js';
import * as actions from '../actions.js';

const withTrailing = (props, left, right) =>
  h(
    'div',
    {
      ...props,
      class: ['flex items-center justify-start'],
    },
    left,
    h(
      'div',
      {
        class: ['flex-shrink'],
      },
      right,
    ),
  );

const readOnlyIcon = props =>
  h(
    'div',
    {
      class: 'w-8',
    },
    text(props.readonly ? '🔏' : ' '),
  );

const participant = isEditable => currentParticipant => {
  return h(
    'fieldset',
    {
      class: 'mb-2 block w-full flex items-center justify-start',
      key: `participant-${currentParticipant.id}`,
    },
    [
      withTrailing(
        {},
        input({
          class: ['flex-grow'],
          readonly: !isEditable(currentParticipant),
          value: currentParticipant.name || '',
          placeholder: 'Participant name',
          oninput: withEvent([
            reactions.preventDefault(),
            reactions.act(e => [
              actions.UpdateAnonymousInMob,
              { ...currentParticipant, name: e.target.value },
            ]),
          ]),
          onblur:
            !currentParticipant.name &&
            withEvent([
              reactions.preventDefault(),
              reactions.act(() => [actions.RemoveFromMob, currentParticipant]),
            ]),
        }),
        [
          readOnlyIcon({ readonly: !isEditable(currentParticipant) }),
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
      ),
    ],
  );
};

const goal = currentGoal =>
  h(
    'div',
    {
      key: `goal-${currentGoal.id}`,
      class: [
        currentGoal.completed &&
          'line-through text-gray-400 dark:text-gray-600',
        'mb-2',
      ],
      contenteditable: 'true',
      onchange: withEvent([
        reactions.act(e =>
          e.target.innerText.trim()
            ? [actions.UpdateGoal, { ...currentGoal, text: e.target.innerText }]
            : [actions.RemoveGoal, currentGoal],
        ),
      ]),
      onblur: withEvent([
        reactions.act(e =>
          e.target.innerText.trim()
            ? [
                actions.UpdateGoal,
                { ...currentGoal, text: e.target.innerText.trim() },
              ]
            : [actions.RemoveGoal, currentGoal],
        ),
      ]),
    },
    text(currentGoal.text),
  );

export const editTimerModal = state => {
  const profile = State.getProfile(state);
  const { duration, positions } = State.getShared(state);
  const mob = State.getMob(state);

  const isEditable = p => p.id.startsWith('anonymous_');

  const goals = State.getGoals(state);

  const selfInMob = mob.some(m => m.id === profile.id);

  return modal(
    {
      left: [],
      right: [{ text: 'Close', action: [actions.SetModal, null] }],
    },
    [
      h(
        'div',
        {
          class: 'mt-4 mb-2 w-full',
        },
        [
          h(
            'div',
            {
              class: ['grid sm:grid-cols-2 gap-4 w-full'],
            },
            [
              group('Timer Configuration', [
                h(
                  'label',
                  { class: 'flex items-center justify-between mb-2' },
                  [
                    h(
                      'div',
                      { class: 'mr-2 whitespace-nowrap' },
                      text('Turn Duration'),
                    ),
                    input({
                      value: formatTime(duration).replace(/^0/, ''),
                      placeholder: 'mm:ss',
                      title: 'Duration formatted as m:ss or mm:ss',
                      oninput: withEvent([
                        reactions.preventDefault(),
                        reactions.inlineFx(({ target }) => {
                          const format = /\d{1,2}:\d{2}/;
                          if (!format.test(target.value)) {
                            target.setCustomValidity(
                              'Duration must by in the format of m:ss or mm:ss',
                            );
                            target.reportValidity();
                            return null;
                          }
                          const [minutes, seconds] = target.value
                            .split(':')
                            .map(v => parseInt(v, 10));
                          const milliseconds =
                            (minutes * 60 + seconds) * 1000 + 999;
                          target.setCustomValidity('');
                          target.reportValidity();
                          return [
                            actions.UpdateSettings,
                            { duration: milliseconds },
                          ];
                        }),
                      ]),
                    }),
                  ],
                ),
                h(
                  'label',
                  { class: 'flex items-center justify-between mb-2' },
                  [
                    h('div', { class: 'mr-2' }, text('Positions')),
                    input({
                      value: positions,
                      oninput: withEvent([
                        reactions.preventDefault(),
                        reactions.act(({ target }) => [
                          actions.UpdateSettings,
                          { positions: target.value },
                        ]),
                      ]),
                    }),
                  ],
                ),
              ]),
              group('Timer Persistance', [
                h(
                  'label',
                  { class: 'flex items-center justify-between mb-2' },
                  [
                    h(
                      'div',
                      { class: 'mr-2' },
                      text('Auto-save timer in browser'),
                    ),
                    h('input', {
                      type: 'checkbox',
                      checked: State.isLocalAutoSaveTimer(state),
                      oninput: preventDefault(event => [
                        actions.AutoSaveTimer,
                        event.target.checked,
                      ]),
                    }),
                  ],
                ),

                h('div', { class: 'flex items-center justify-between mb-2' }, [
                  h('div', { class: 'mr-2' }, text('Local storage')),
                  h('div', {}, [
                    button(
                      {
                        class: 'ml-1',
                        size: 'md',
                        color: 'indigo',
                        onclick: actions.SaveTimer,
                      },
                      text('Save'),
                    ),
                    button(
                      {
                        class: 'ml-1',
                        size: 'md',
                        color: 'blue',
                        onclick: actions.LoadTimer,
                      },
                      text('Load'),
                    ),
                    button(
                      {
                        class: 'ml-1',
                        size: 'md',
                        color: 'red',
                        onclick: actions.DeleteTimer,
                      },
                      text('Clear'),
                    ),
                  ]),
                ]),
              ]),
            ],
          ),
          h(
            'div',
            {
              class: ['grid sm:grid-cols-2 gap-4 w-full'],
            },
            [
              group('Participants', [
                h('div', {}, mob.map(participant(isEditable))),
                h(
                  'div',
                  {
                    class: ['flex items-center justify-start', 'mb-2'],
                  },
                  [
                    input({
                      class: ['w-full', 'flex-grow'],
                      onkeydown: handleKeydown(e => !e.repeat, {
                        Enter: withEvent([
                          reactions.act(() => [
                            actions.AddParticipantText,
                            State.getExternals(state).makeId(),
                          ]),
                          reactions.act(() => [
                            actions.UpdateParticipantText,
                            '',
                          ]),
                        ]),
                        placeholder: 'Add your goal here...',
                      }),
                      oninput: withEvent([
                        reactions.act(e => [
                          actions.UpdateParticipantText,
                          e.target.value || '',
                        ]),
                      ]),
                      placeholder: 'Add adhoc participants here',
                      value: State.getLocal(state).addParticipant,
                    }),
                    !selfInMob &&
                      h(
                        'span',
                        { class: 'whitespace-nowrap mx-1' },
                        text('or'),
                      ),
                    !selfInMob &&
                      button(
                        {
                          onclick: preventDefault(() => [actions.AddMeToMob]),
                          class: ['mr-1', 'whitespace-nowrap'],
                          size: 'sm',
                        },
                        text('Add yourself'),
                      ),
                  ],
                ),
                h('div', { class: 'flex items-center justify-start' }, [
                  mob.length > 1 &&
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
                h('div', {}, goals.map(goal)),
                textarea({
                  class: ['w-full'],
                  onkeydown: handleKeydown(e => !e.repeat && !e.shiftKey, {
                    Enter: withEvent([
                      reactions.act(() => [
                        actions.AddGoalText,
                        State.getExternals(state).makeId(),
                      ]),
                      reactions.act(() => [actions.UpdateGoalText, '']),
                    ]),
                  }),
                  oninput: withEvent([
                    reactions.act(e => [
                      actions.UpdateGoalText,
                      e.target.value || '',
                    ]),
                  ]),
                  placeholder: 'Add goals here...',
                  value: State.getLocal(state).addGoal,
                }),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
};
