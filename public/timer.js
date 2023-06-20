import * as actions from '/actions.js';
import { grid } from '/components/grid.js';
import { column } from '/components/column.js';
import { mob } from '/tabs/mob.js';
import { goals } from '/tabs/goals.js';
import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';
import { summary } from '/sections/summary.js';
import { localSettings } from '/tabs/localSettings.js';
import { timerSettings } from '/tabs/timerSettings.js';
import * as subscriptions from '/subscriptions.js';
import { app, h, text, memo } from '/vendor/hyperapp.js';
import * as Emitter from '/lib/emitter.js';

const stateWithoutFrequentChanges = ({ timerStartedAt, timerDuration, currentTime, mob, goals, ...state }) => state;

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);
const flags = window.location.search
  .slice(1)
  .split('&')
  .reduce((memo, option) => {
    const [key, value] = option.split('=');
    return {
      ...memo,
      [key]: value,
    };
  }, {});

app({
  init: actions.Init(null, {
    timerId: initialTimerId,
    externals: {
      fetch: window.fetch,
      documentElement: window.document,
      Notification: window.Notification,
      storage: window.localStorage,
      location: window.location,
      history: window.history,
      socketEmitter: Emitter.make(),
    },
    lang: flags.lang || 'en_CA',
    dark: 'dark' in flags,
  }),

  view: state => {
    const loadingPercent = (state.loading.total - state.loading.messages.length);
    const isLoading = loadingPercent < state.loading.total;

    return grid({ class: 'relative pb-12' }, [
      h('div', {}, text(state.loading.messages.join(', '))),
      column.fixed(2, header(state)),
      h('div', { class: 'flex flex-row items-center justify-center' }, [
        timeRemaining(state),
      ]),
      summary(state),
      isLoading && column.fixed(2, [
        h('progress', { max: 4, value: loadingPercent, class: 'w-full', style: { height: '2px' } }),
      ]),
      !isLoading && column.fixed(2, [
        h('details', { open: state.details.summary, ontoggle: (_, event) => [actions.DetailsToggle, { which: 'summary', open: event.target.open }] }, [
          h('summary', { class: 'text-xs text-slate-500' }, [
            text('Your Session'),
          ]),
          grid({}, [
            column(2, { sm: 1 }, mob(state)),
            column(2, { sm: 1 }, goals(state)),
          ]),
        ]),
      ]),
      !isLoading && column.fixed(2, [
        h('details', { open: state.details.advancedSettings, ontoggle: (_, event) => [actions.DetailsToggle, { which: 'advancedSettings', open: event.target.open }] }, [
          h('summary', { class: 'text-xs text-slate-500' }, [
            text('Advanced Settings'),
          ]),
          grid({}, [
            column(2, { sm: 1 }, memo(localSettings, stateWithoutFrequentChanges(state))),
            column(2, { sm: 1 }, memo(timerSettings, stateWithoutFrequentChanges(state))),
          ]),
        ]),
      ]),

      h(
        'audio',
        {
          preload: 'auto',
          id: 'timer-complete',
          key: state.sound,
        },
        [
          h('source', {
            src: `/audio/${state.sound}.wav`,
            type: 'audio/wav',
          }),
        ],
      ),
    ]);
  },

  subscriptions: state => {
    const { timerId, drag, websocketConnect, externals } = state;

    return [
      websocketConnect &&
      subscriptions.Websocket({
        actions,
        externals,
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
