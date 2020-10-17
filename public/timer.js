import * as actions from '/actions.js';
import { badge } from '/components/badge.js';
import { button } from '/components/button.js';
import { card } from '/components/card.js';
import { checkbox } from '/components/checkbox.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { appPrompt } from '/components/prompt.js';
import { section } from '/components/section.js';
import { settings } from '/components/settings.js';
import { tab } from '/components/tab.js';
import { addGoal } from '/sections/addGoal.js';
import { addParticipant } from '/sections/addParticipant.js';
import { goalList } from '/sections/goalList.js';
import { header } from '/sections/header.js';
import { nextBreak } from '/sections/nextBreak.js';
import { mobActions } from '/sections/mobActions.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import { qrShare } from '/sections/qrShare.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { mobOrder } from '/settings/mobOrder.js';
import { setLength } from '/settings/setLength.js';
import { breaks } from './settings/breaks.js';
import * as subscriptions from '/subscriptions.js';
import { app, h } from '/vendor/hyperapp.js';
import { removeCompletedGoals } from './sections/removeCompletedGoals.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);

const getGoalsDetails = ({ goals }) => {
  const total = goals.length;

  if (total === 0) {
    return '';
  }

  const completed = goals.filter(g => g.completed).length;

  return h(badge, {}, `${completed}/${total}`);
};

const connectionStatus = ({ websocket }) => {
  if (!websocket || websocket.readyState === WebSocket.CONNECTING) {
    return 'will-connect';
  }
  return websocket.readyState === WebSocket.OPEN
    ? 'connected'
    : 'will-reconnect';
};

const websocketStatusClass = {
  'will-connect': {
    'bg-transparent': true,
    'text-gray-400': true,
  },
  "connected": {
    'bg-transparent': true,
    'text-gray-400': true,
  },
  'will-reconnect': {
    'bg-red-500': true,
    'text-white': true,
  },
};

const websocketStatusMessage = {
  'will-connect': 'Websocket connecting...',
  "connected": 'Websocket Connection established',
  'will-reconnect': 'Websocket reconnecting...',
};

app({
  init: actions.Init(null, initialTimerId),

  view: state =>
    h(
      'div',
      {
        class: {
          "flex": true,
          'items-start': true,
          'justify-center': true,
          'bg-indigo-700': true,
          'min-h-screen': true,
        },
      },
      [
        h(
          card,
          {
            class: {
              'box-border': true,
              'min-h-screen': true,
              'sm:min-h-0': true,
              'w-full': true,
              'sm:w-8/12': true,
              'md:w-10/12': true,
              'lg:w-6/12': true,
              "shadow": false,
              'sm:shadow-lg': true,
              'pt-2': false,
              'pt-0': true,
              'pb-12': true,
              'pb-1': false,
              'sm:mt-2': true,
              "rounded": false,
              'sm:rounded': true,
              'bg-indigo-600': true,
              'text-white': true,
              "relative": true,
            },
          },
          [
            h(header),

            h(timeRemaining, state),

            h(
              'div',
              {
                class: {
                  "flex": true,
                  'flex-row': true,
                  'flex-wrap': true,
                  'px-2': true,
                  'py-4': true,
                  'sm:px-4': true,
                },
              },
              [
                h(
                  tab,
                  {
                    selected: state.timerTab === 'overview',
                    onclick: [actions.SetTimerTab, 'overview'],
                  },
                  'Overview',
                ),
                h(
                  tab,
                  {
                    selected: state.timerTab === 'mob',
                    onclick: [actions.SetTimerTab, 'mob'],
                    details:
                      state.mob.length > 0 &&
                      h(badge, {}, state.mob.length.toString()),
                  },
                  'Mob',
                ),
                h(
                  tab,
                  {
                    selected: state.timerTab === 'goals',
                    onclick: [actions.SetTimerTab, 'goals'],
                    details: getGoalsDetails(state),
                  },
                  'Goals',
                ),
                h(
                  tab,
                  {
                    selected: state.timerTab === 'timer-settings',
                    onclick: [actions.SetTimerTab, 'timer-settings'],
                  },
                  'Timer Settings',
                ),
                h(
                  tab,
                  {
                    selected: state.timerTab === 'client-settings',
                    onclick: [actions.SetTimerTab, 'client-settings'],
                  },
                  'Client Settings',
                ),
                h(
                  tab,
                  {
                    selected: state.timerTab === 'share',
                    onclick: [actions.SetTimerTab, 'share'],
                  },
                  'Share',
                ),
              ],
            ),

            state.timerTab === 'overview' && [
              h(
                overviewHeading,
                {
                  rightAction: h(
                    button,
                    {
                      type: 'button',
                      onclick: [actions.SetTimerTab, 'mob'],
                    },
                    'Edit Mob',
                  ),
                },
                "Who's Up",
              ),
              h(mobParticipants, {
                overview: true,
                expandedReorderable: state.expandedReorderable,
                drag: {},
                mob: state.mob.slice(
                  0,
                  state.settings.mobOrder.split(',').length || 2,
                ),
                mobOrder: state.settings.mobOrder,
              }),

              ...(state.settings.breaksEnabled
                ? [
                    h(
                      overviewHeading,
                      {
                        rightAction: h(
                          button,
                          {
                            type: 'button',
                            onclick: [actions.SetTimerTab, 'timer-settings'],
                          },
                          'Edit Break',
                        ),
                      },
                      'Next break',
                    ),
                    h(nextBreak, {
                      breakTimerStartedAt: state.breakTimerStartedAt,
                      currentTime: state.currentTime,
                      breakCadence: state.settings.breakCadence,
                    }),
                  ]
                : []),

              h(
                overviewHeading,
                {
                  rightAction: h(
                    button,
                    {
                      type: 'button',
                      onclick: [actions.SetTimerTab, 'goals'],
                    },
                    'Edit Goals',
                  ),
                },
                'Top Goals',
              ),
              h(goalList, {
                overview: true,
                expandedReorderable: state.expandedReorderable,
                drag: {},
                goals: state.goals.filter(g => !g.completed).slice(0, 3),
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
                addMultiple: state.addMultiple,
              }),
              h(removeCompletedGoals, { goals: state.goals }),
            ],

            state.timerTab === 'timer-settings' &&
              h(
                settings,
                {
                  pendingSettings: state.pendingSettings,
                },
                [
                  h(setLength, {
                    pendingSettings: state.pendingSettings,
                    settings: state.settings,
                  }),
                  h(breaks, {
                    pendingSettings: state.pendingSettings,
                    settings: state.settings,
                  }),
                  h(mobOrder, {
                    pendingSettings: state.pendingSettings,
                    settings: state.settings,
                  }),
                ],
              ),

            state.timerTab === 'client-settings' && [
              h(
                overviewHeading,
                {
                  rightAction: [],
                },
                'Connection Information',
              ),
              h(section, {}, [
                h(
                  checkbox,
                  {
                    id: 'is-owner',
                    checked: state.isOwner,
                    inputProps: {
                      readonly: true,
                    },
                  },
                  h(
                    'span',
                    {
                      class: 'text-4xl',
                    },
                    state.isOwner
                      ? 'You are the timer owner'
                      : 'You are not the timer owner',
                  ),
                ),
              ]),
              h(
                overviewHeading,
                {
                  rightAction: [],
                },
                'Notifications',
              ),
              h(section, {}, [
                h(
                  'div',
                  {
                    class: 'text-sm mb-2',
                  },
                  [
                    h(
                      checkbox,
                      {
                        id: 'enable-sound',
                        checked: state.allowSound,
                        inputProps: {
                          onchange: (_, event) => [
                            actions.SetAllowSound,
                            event.target.checked,
                          ],
                        },
                      },
                      h('span', { class: 'text-2xl' }, 'Enable timer sounds'),
                    ),
                  ],
                ),
                h(
                  'div',
                  {
                    class: 'text-xs mb-2 ml-10',
                  },
                  [
                    'Pneumatic horn sound provided by ',
                    h(
                      'a',
                      {
                        href:
                          'https://bigsoundbank.com/detail-1828-pneumatic-horn-simple-2.html',
                        target: '_blank',
                      },
                      'bigsoundbank.com',
                    ),
                  ],
                ),
                h(
                  'div',
                  {
                    class: 'text-sm mb-2',
                  },
                  [
                    h(
                      checkbox,
                      {
                        id: 'enable-notifications',
                        checked: state.allowNotification,
                        inputProps: {
                          onchange: (_, event) => [
                            actions.SetAllowNotification,
                            {
                              allowNotification: event.target.checked,
                              Notification: window.Notification,
                              documentElement: document,
                            },
                          ],
                        },
                      },
                      h(
                        'span',
                        { class: 'text-2xl' },
                        'Enable browser notifications',
                      ),
                    ),
                  ],
                ),
                !state.notificationPermissions ||
                  (state.notificationPermissions === 'default' &&
                    h(
                      button,
                      {
                        class: {
                          'text-md': true,
                          'bg-green-500': true,
                          'text-white': true,
                          'flex-grow': true,
                        },
                        onclick: [
                          actions.RequestNotificationPermission,
                          {
                            Notification: window.Notification,
                            documentElement: document,
                          },
                        ],
                      },
                      'Request notification permission',
                    )),
              ]),
            ],

            state.timerTab === 'share' && [h(qrShare)],

            h(
              section,
              {
                class: {
                  'w-full': true,
                  ...websocketStatusClass[connectionStatus(state)],
                  'text-center': true,
                  'text-xs': true,
                },
              },
              websocketStatusMessage[connectionStatus(state)],
            ),

            h(
              'audio',
              {
                preload: 'auto',
                id: 'timer-complete',
              },
              [
                h('source', {
                  src: 'https://bigsoundbank.com/UPLOAD/mp3/1828.mp3',
                  type: 'audio/mp3',
                }),
                h('source', {
                  src: 'https://bigsoundbank.com/UPLOAD/wav/1828.wav',
                  type: 'audio/wav',
                }),
                h('source', {
                  src: 'https://bigsoundbank.com/UPLOAD/flac/1828.flac',
                  type: 'audio/flac',
                }),
              ],
            ),

            state.prompt.visible &&
              h(appPrompt, {
                ...state.prompt,
              }),
          ],
        ),
      ],
    ),

  subscriptions: state => {
    const { timerId, drag } = state;

    return [
      timerId &&
        subscriptions.Websocket({
          actions,
          timerId,
        }),

      subscriptions.Timer({
        timerStartedAt: state.timerStartedAt,
        timerDuration: state.timerDuration,
        actions,
      }),

      drag.type &&
        subscriptions.DragAndDrop({
          active: drag.active,
          DragMove: actions.DragMove,
          DragEnd: actions.DragEnd,
          DragCancel: actions.DragCancel,
        }),
    ];
  },

  node: document.querySelector('#app'),
});
