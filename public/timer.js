import * as actions from '/actions.js';
import { grid } from '/components/grid.js';
import { column } from '/components/column.js';
import { details } from '/components/details.js';
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

const cleanState = state => ({
  ...state,
  goals: state.goals.filter(goal => {
    return goal !== null;
  }),
})

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

const darkDefault = ('dark' in flags) ||
  window.matchMedia('(prefers-color-scheme: dark)').matches;

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
    dark: darkDefault,
  }),

  view: state => {
    const loadingPercent = (state.loading.total - state.loading.messages.length);
    const isLoading = loadingPercent < state.loading.total;

    return h('div', {}, [
      state.allowSound && !state.hasInteractedWithPage && h('div', { class: 'text-center px-2 bg-amber-400 text-white' }, [
        h('div', {}, text('You have enabled sound, but never interacted with the page. Click or touch on this page to remove this warning.')),
        h('a', { href: 'https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide', target: 'mdn-auto-play', class: 'border-b border-blue-500' }, [
          text('See this MDN article on auto-play for more information'),
          h('span', { class: 'ml-1', innerHTML: '&#10697;' }),
        ]),
      ]),
      grid({ class: 'relative pb-12 px-2' }, [
        column.fixed(2, header(state)),

        column(2, { md: 1 }, [
          h('div', { class: 'flex flex-row items-center justify-center' }, [
            timeRemaining(state),
          ]),
        ]),
        column(2, { md: 1 }, [
          summary(state),
        ]),
        isLoading && column.fixed(2, [
          h('progress', { max: 4, value: loadingPercent, class: 'w-full', style: { height: '2px' } }),
        ]),
        !isLoading && column.fixed(2, [
          details({ which: 'summary', details: state.details, summary: 'Your Session' }, [
            grid({}, [
              column(2, { md: 1 }, mob(state)),
              column(2, { md: 1 }, goals(state)),
            ]),
          ]),
        ]),
        !isLoading && column.fixed(2, [
          details({ which: 'advancedSettings', details: state.details, summary: 'Advanced Settings' }, [
            grid({}, [
              column(2, { md: 1 }, memo(localSettings, stateWithoutFrequentChanges(state))),
              column(2, { md: 1 }, memo(timerSettings, stateWithoutFrequentChanges(state))),
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
      ]),
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

      !state.hasInteractedWithPage &&
      subscriptions.PageInteraction({
        onInteraction: actions.SetPageInteraction,
        document: state.externals.documentElement,
      }),
    ];
  },

  node: document.querySelector('#app'),
});
