import { h, text } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

export const summary = (props) => {
  const firstIncompleteGoal = props.goals.filter(g => !g.completed)[0];

  return h('div', {
    // class: 'flex items-center justify-start',
  }, [
    h('ol', {}, [
      ...props.settings.mobOrder.split(',').map((position, index) => {
        return h('li', { class: 'mb-2' }, [
          h('div', { class: 'text-xs leading-none uppercase text-slate-600' }, text(position)),
          h('div', {}, text(props.mob[index]?.name || 'Empty')),
        ]);
      }),
    ]),
    firstIncompleteGoal && h('div', { class: 'mb-2' }, [
      h('hr', { class: 'mb-2' }),
      h('div', { class: 'text-xs leading-none uppercase text-slate-600' }, text('Current Goal')),
      h('div', { class: '' }, [
        text(firstIncompleteGoal.text),
      ]),
    ]),
    h('div', {}, [
      h('hr', { class: 'mb-2' }),
      h('div', { class: 'text-xs uppercase text-slate-600' }, text('Turn Controls')),
      h('div', { class: 'grid grid-cols-3' }, [
        h('button', {
          type: 'button',
          class: [
            'mr-1 px-2 py-1 border border-slate-700',
            props.timerStartedAt && 'bg-slate-200 text-black cursor-not-allowed',
          ].filter(Boolean).join(' '),
          disabled: props.timerStartedAt,
          onclick: props.timerDuration
            ? [actions.ResumeTimer, {}]
            : [actions.StartTimer, { timerStartedAt: Date.now(), timerDuration: props.settings.duration }],
        }, text('Start')),
        h('button', {
          type: 'button',
          class: [
            'mr-1 px-2 py-1 border border-slate-700',
            !props.timerStartedAt && 'bg-slate-200 text-black cursor-not-allowed',
          ].filter(Boolean).join(' '),
          disabled: !props.timerStartedAt,
          onclick: [actions.PauseTimer, undefined],
        }, text('Pause')),
        h('button', {
          type: 'button',
          class: [
            'mr-1 px-2 py-1 border border-slate-700',
            !props.timerDuration && 'bg-slate-200 text-black cursor-not-allowed',
          ].join(' '),
          disabled: !props.timerDuration,
          onclick: [
            actions.Completed,
            {
              isEndOfTurn: true,
              documentElement: document,
              Notification: window.Notification,
            },
          ],
        }, text('Skip')),
      ]),
    ]),
  ]);
};
