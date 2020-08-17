import { app, h } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';
import * as subscriptions from '/subscriptions.js';

import { card } from '/components/card.js';
import { fullButton } from '/components/fullButton.js';
import { section } from '/components/section.js';
import { tab } from '/components/tab.js';
import { settings } from '/components/settings.js';
import { badge } from '/components/badge.js'; import { button } from '/components/button.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { appPrompt } from '/components/prompt.js';

import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';

import { goalList } from '/sections/goalList.js';
import { addGoal } from '/sections/addGoal.js';

import { mobParticipants } from '/sections/mobParticipants.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';

import { setLength } from '/settings/setLength.js';
import { mobOrder } from '/settings/mobOrder.js';

import { qrShare } from '/sections/qrShare.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);

const getGoalsDetails = ({ goals }) => {
  const total = goals.length;

  if (total === 0) {
    return '';
  }

  const completed = goals.filter((g) => g.completed).length;

  return h(badge, {}, `${completed}/${total}`);
};

const connectionStatus = ({ websocket }) => {
  if (!websocket || websocket.readyState === WebSocket.CONNECTING) {
    return 'will-connect';
  }
  return websocket.readyState === WebSocket.OPEN
    ? 'connected' : 'will-reconnect';
};

const websocketStatusClass = {
  'will-connect': {
    'bg-transparent': true,
    'text-gray-400': true,
  },
  'connected': {
    'bg-transparent': true,
    'text-gray-400': true,
  },
  'will-reconnect': {
    'bg-red-500': true,
    'text-white': true
  },
};

const websocketStatusMessage = {
  'will-connect': 'Websocket connecting...',
  'connected': 'Websocket Connection established',
  'will-reconnect': 'Websocket reconnecting...',
};

app({
  init: actions.Init(null, initialTimerId),

  view: (state) => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
    },
  }, [
    h(card, {
      class: {
        'box-border': true,
        'min-h-screen': true,
        'sm:min-h-0': true,
        'w-full': true,
        'sm:w-8/12': true,
        'md:w-10/12': true,
        'lg:w-6/12': true,
        'xl:w-4/12': true,
        'shadow': false,
        'sm:shadow-lg': true,
        'pt-2': false,
        'pt-0': true,
        'pb-12': true,
        'pb-1': false,
        'sm:mt-2': true,
        'rounded': false,
        'sm:rounded': true,
        'bg-indigo-600': true,
        'text-white': true,
        'relative': true,
      },
    }, [
      h(header),

      h(timeRemaining, state),

      h('div', {
        class: {
          'flex': true,
          'flex-row': true,
          'flex-wrap': true,
          'px-2': true,
          'py-4': true,
          'sm:px-4': true,
        },
      }, [
        h(tab, {
          selected: state.timerTab === 'overview',
          onclick: [actions.SetTimerTab, 'overview'],
        }, 'Overview'),
        h(tab, {
          selected: state.timerTab === 'mob',
          onclick: [actions.SetTimerTab, 'mob'],
          details: state.mob.length > 0
            && h(badge, {}, state.mob.length.toString()),
        }, 'Mob'),
        h(tab, {
          selected: state.timerTab === 'goals',
          onclick: [actions.SetTimerTab, 'goals'],
          details: getGoalsDetails(state),
        }, 'Goals'),
        h(tab, {
          selected: state.timerTab === 'timer-settings',
          onclick: [actions.SetTimerTab, 'timer-settings'],
        }, 'Timer Settings'),
        h(tab, {
          selected: state.timerTab === 'client-settings',
          onclick: [actions.SetTimerTab, 'client-settings'],
        }, 'Client Settings'),
        h(tab, {
          selected: state.timerTab === 'share',
          onclick: [actions.SetTimerTab, 'share'],
        }, 'Share'),
      ]),

      state.timerTab === 'overview' && [
        h(overviewHeading, {
          rightAction: (
            h(button, {
              type: 'button',
              onclick: [actions.SetTimerTab, 'mob'],
            }, 'Edit Mob')
          ),
        }, 'Who\'s Up'),
        h(mobParticipants, {
          overview: true,
          expandedReorderable: state.expandedReorderable,
          drag: {},
          mob: state.mob.slice(0, state.settings.mobOrder.split(',').length || 2),
          mobOrder: state.settings.mobOrder,
        }),

        h(overviewHeading, {
          rightAction: (
            h(button, {
              type: 'button',
              onclick: [actions.SetTimerTab, 'goals'],
            }, 'Edit Goals')
          ),
        }, 'Top Goals'),
        h(goalList, {
          overview: true,
          expandedReorderable: state.expandedReorderable,
          drag: {},
          goals: state.goals.filter((g) => !g.completed).slice(0, 3),
        }),

      ],


      state.timerTab === 'mob' && [
        h(mobParticipants, {
          expandedReorderable: state.expandedReorderable,
          drag: state.drag.type === 'mob' ? state.drag : {},
          mob: state.mob,
          mobOrder: state.settings.mobOrder,
        }),

        h(addParticipant, {
          name: state.name,
        }),

        h(mobActions),
      ],

      state.timerTab === 'goals' && [
        h(goalList, {
          expandedReorderable: state.expandedReorderable,
          drag: state.drag.type === 'goal' ? state.drag : {},
          goals: state.goals,
        }),
        h(addGoal, {
          goal: state.goal,
        }),
      ],

      state.timerTab === 'timer-settings' && h(settings, {
        pendingSettings: state.pendingSettings,
      }, [
        h(setLength, {
          pendingSettings: state.pendingSettings,
          settings: state.settings,
        }),
        h(mobOrder, {
          pendingSettings: state.pendingSettings,
          settings: state.settings,
        }),
      ]),

      state.timerTab === 'share' && [
        h(qrShare),
      ],

      h(section, {
        class: {
          'w-full': true,
          ...websocketStatusClass[connectionStatus(state)],
          'text-center': true,
          'text-xs': true,
        },
      }, websocketStatusMessage[connectionStatus(state)]),

      h(fullButton, {
        onclick: actions.RequestNotificationPermission,
        class: {
          'hidden': !(!state.allowNotification && ('Notification' in window)),
          'bg-green-500': true,
          'hover:bg-green-700': true,
          'uppercase': true,
          'font-light': true,
          'tracking-widest': true,
          'rounded-tr-lg': true,
          'py-1': true,
        },
      }, 'Enable Notifications'),

      state.prompt.visible && h(appPrompt, {
        ...state.prompt,
      }),
    ]),

  ]),

  subscriptions: (state) => {
    const { timerId, drag } = state;

    return [
      timerId && subscriptions.Websocket({
        actions,
        timerId,
      }),

      subscriptions.Timer({
        timerStartedAt: state.timerStartedAt,
        timerDuration: state.timerDuration,
        actions,
      }),

      drag.type && subscriptions.DragAndDrop({
        active: drag.active,
        DragMove: actions.DragMove,
        DragEnd: actions.DragEnd,
        DragCancel: actions.DragCancel,
      }),
    ];
  },

  node: document.querySelector('#app'),
});
