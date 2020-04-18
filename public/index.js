import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';
import * as subscriptions from '/subscriptions.js';
import timerRemainingDisplay from '/formatTime.js';
import Status from '/status.js';

import { card } from '/components/card.js';
import { button } from '/components/button.js';
import { fullButton } from '/components/fullButton.js';
import { mobber } from '/components/mobber.js';
import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { goal } from '/components/goal.js';
import { reorderable } from '/components/reorderable.js';

const [timerId] = window.location.pathname.split('/').filter(v => v);

const renderMob = (mob, mobDrag) => {
  const [mobNavigator, mobDriver, ...rest] = mob;

  const items = [
    { name: mobNavigator, position: 'Navigator' },
    { name: mobDriver, position: 'Driver' },
    ...rest.map(name => ({ name, position: 'mob' })),
  ];

  return h('div', null, h(reorderable, {
    items,
    getKey: ({ name }) => name,
    height: 64,
    component: mobber,
    onDragStart: actions.StartMobDrag,
    onDragOver: actions.MoveMobDrag,
    onDragEnd: actions.EndMobDrag,
    onDrop: actions.DropMobDrag,
    drag: mobDrag,
    onRemove: actions.RemoveNameFromMob,
  }));
};

app({
  init: actions.Init(null, timerId),

  view: state => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
      'pb-3': true,
    },
  }, h(card, {
    class: {
      'h-full': true,
      'sm:h-auto': true,
      'w-full': true,
      'sm:w-8/12': true,
      'lg:w-6/12': true,
      'xl:w-4/12': true,
      'shadow': false,
      'sm:shadow-lg': true,
      'pt-2': false,
      'pt-0': true,
      'pb-0': true,
      'pb-1': false,
      'sm:mt-2': true,
      'rounded': false,
      'sm:rounded': true,
      'bg-indigo-600': true,
      'text-white': true,
    },
  }, [
    h(section, {
      class: {
        'flex': true,
        'flex-row': true,
        'align-center': true,
        'justify-between': true,
      },
    }, [
      h('h1', {
        class: {
          'text-6xl': true,
          'font-bold': true,
          'flex': true,
          'p-0': true,
          'm-0': true,
        },
      }, timerRemainingDisplay(state.remainingTime)),
      h('div', {
        class: {},
      }, [
        h(button, {
          class: {
            'block': true,
            'w-full': true,
            'mb-1': true,
          },
          disabled: state.serverState.timerStartedAt === null,
          onclick: actions.PauseTimer,
        }, 'Pause'),
        h(button, {
          class: {
            'block': true,
            'w-full': true,
          },
          disabled: state.serverState.timerDuration === 0 || (state.serverState.timerStartedAt !== null),
          onclick: actions.ResumeTimer,
        }, 'Resume'),
      ]),
    ]),

    h('hr'),

    h('form', {
      action: '#',
      method: 'get',
      onsubmit: [
        actions.StartTimer,
        e => {
          e.preventDefault();
          return undefined;
        }
      ],
    }, [
      h(section, {
        class: {
          'flex': true,
          'flex-row': true,
          'items-center': true,
          'justify-between': true,
        },
      }, [
        h('span', null, [
          h('span', null, 'Start timer for'),
          h('label', null, [
            h(input, {
              type: 'number',
              value: state.timeInMinutes,
              min: 1,
              max: 60,
              step: 1,
              oninput: [actions.UpdateTimeInMinutes, e => e.target.value],
              style: {
                width: '50px',
                textAlign: 'center',
                fontWeight: 'bold',
              },
            }),
            h('span', null, `minute${state.timeInMinutes != 1 ? 's' : ''}`),
          ]),
        ]),
        h(button, {
          type: 'submit',
          disabled: !state.timeInMinutes,
        }, 'Go!'),
      ]),
    ]),

    h('hr'),

    h(section, {}, [
      state.serverState.goals.map(({ text, completed }) => h(goal, {
        text,
        completed,
      })),
      state.serverState.goals.length === 0 && h(
        'span',
        {
          class: {
            'text-gray-400': true,
          },
        },
        'No goals, add one now',
      ),

    ]),

    state.serverState.goals.length < 5 && [
      h('hr'),

      h('form', {
        action: '#',
        method: 'get',
        onsubmit: [
          actions.AddGoal,
          e => {
            e.preventDefault();
            return undefined;
          },
        ],
      }, [
        h(section, {
          class: {
            'flex': true,
            'flex-row': true,
            'items-center': true,
            'justify-between': true,
          },
        }, [
          h('label', null, [
            h('span', { class: { 'mr-1': true } }, 'Add'),
            h(input, {
              autofocus: 'autofocus',
              value: state.goal,
              oninput: [actions.UpdateGoalText, e => e.target.value],
              placeholder: 'Refactor tricky code...',
              style: {
                minWidth: '160px',
                fontWeight: 'bold',
              },
            }),
            h('span', { class: { 'ml-1': true } }, 'as a goal'),
          ]),
          h(button, {
            type: 'submit',
            disabled: !state.goal,
          }, 'Go!'),
        ]),
      ]),
    ],

    h('hr'),

    h(section, null, [
      state.serverState.mob.length > 0 && h('div', {
        class: {
          'flex': true,
          'items-center': true,
          'justify-between': true,
        },
      }, [
        h(button, { onclick: actions.CycleMob }, 'Rotate Roles'),
        h(button, {
          disabled: state.serverState.lockedMob,
          onclick: actions.ShuffleMob,
        }, 'Randomize Order'),
        state.serverState.lockedMob
          ?  h(button, { onclick: actions.UnlockMob }, 'Unlock Mob')
          :  h(button, { onclick: actions.LockMob }, 'Lock Mob'),
      ]),
      renderMob(state.serverState.mob, state.mobDrag),
    ]),

    h('hr'),

    state.serverState.lockedMob === null && h('form', {
      action: '#',
      method: 'get',
      onsubmit: [
        actions.AddNameToMob,
        e => {
          e.preventDefault();
          return undefined;
        },
      ],
    }, [
      h(section, {
        class: {
          'flex': true,
          'flex-row': true,
          'items-center': true,
          'justify-between': true,
        },
      }, [
        h('label', null, [
          h('span', null, 'Add'),
          h(input, {
            autofocus: 'autofocus',
            value: state.name,
            oninput: [actions.UpdateName, e => e.target.value],
            placeholder: 'Name here...',
            style: {
              minWidth: '160px',
              fontWeight: 'bold',
            },
          }),
          h('span', {
            class: {
              'hidden': true,
              'sm:inline': true,
            },
          }, 'to the mob'),
        ]),
        h(button, {
          type: 'submit',
          disabled: !state.name,
        }, 'Go!'),
      ]),
    ]),

    h('hr'),

    h(section, {
      class: {
        'sm:flex': true,
        'flex-col': true,
        'items-center': true,
        'justify-center': true,
        'hidden': true,
      },
    }, [
      h('div', {
        class: {
          'text-md': true,
          'text-gray-600': true,
          'mb-3': true,
        },
      }, 'Scan this code to get the timer on your phone'),
      h('img', {
        src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location}`,
        class: {
          'mb-3': true,
        },
      }),
    ]),

    h('hr', {
      class: {
        'hidden': true,
        'sm:block': true,
      },
    }),

    h(section, {
      class: {
        'w-full': true,
        ...Status.caseOf({
          Connecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Connected: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Reconnecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Error: () => ({ 'bg-red-500': true, 'text-white': true }),
        }, state.status),
        'text-center': true,
        'text-xs': true,
      },
    },
      Status.caseOf({
        Connecting: () => 'Websocket connecting',
        Connected: () => `Websocket connected, with ${state.serverState.connections - 1} other(s)`,
        Reconnecting: () => 'Websocket reconnecting',
        Error: (err) => `Error: ${err}`
      }, state.status),
    ),
    !state.allowNotification && ('Notification' in window) && h(fullButton, {
      onclick: actions.RequestNotificationPermission,
      class: {
        'w-full': false,
        'w-3/4': true,
        'bg-blue-500': false,
        'hover:bg-blue-700': false,
        'bg-green-500': true,
        'hover:bg-green-700': true,
        'uppercase': true,
        'font-bold': false,
        'font-light': true,
        'tracking-wider': true,
        'rounded-tr-lg': true,
        'py-3': false,
        'py-1': true,
      },
    }, 'Enable Notifications'),
  ])),

  subscriptions: state => [
    state.timerId && subscriptions.Websocket({ actions, timerId: state.timerId }),
    Status.caseOf({
      Connected: token => subscriptions.KeepAlive({ token }),
      Connecting: () => false,
      Reconnecting: () => false,
      Error: () => false,
    }, state.status),
    subscriptions.Timer({
      timerStartedAt: state.serverState.timerStartedAt,
      timerDuration: state.serverState.timerDuration,
      actions,
    }),
  ],

  node: document.querySelector('#app'),
});

