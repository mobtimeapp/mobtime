import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';
import * as subscriptions from '/subscriptions.js';
import Status from '/status.js';

import { card } from '/components/card.js';
import { button } from '/components/button.js';
import { fullButton } from '/components/fullButton.js';
import { section } from '/components/section.js';
import { input } from '/components/input.js';
import { goal } from '/components/goal.js';

import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { setLength } from '/sections/setLength.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';
// import { qrShare } from '/sections/qrShare.js';

const [timerId] = window.location.pathname.split('/').filter(v => v);

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
    h(header),

    h(timeRemaining, {
      remainingTime: state.remainingTime,
      serverState: state.serverState,
    }),

    h(setLength, {
      timeInMinutes: state.timeInMinutes,
    }),

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

    h(mobParticipants, {
      mobDrag: state.mobDrag,
      mob: state.serverState.mob,
    }),

    h(addParticipant, {
      name: state.name,
    }),

    h(mobActions),

    // h(qrShare),

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
        'bg-green-500': true,
        'hover:bg-green-700': true,
        'uppercase': true,
        'font-light': true,
        'tracking-widest': true,
        'rounded-tr-lg': true,
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

