import { h, text } from '/vendor/hyperapp.js';

import * as actions from '/actions.js';

const subGoalRegex = () => /^[- \t]+/;

const isSubGoal = (g) => {
  if (!g) return false;
  return subGoalRegex().test(g.text);
};

export const summary = (props) => {
  const index = props.goals.findIndex(g => !g.completed);
  const incomplete = {
    goal: null,
    subGoal: null,
  };
  if (index >= 0) {
    incomplete.goal = props.goals[index];
    if (!isSubGoal(incomplete.goal)) {
      for (let i = index + 1; i < props.goals.length && isSubGoal(props.goals[i]) && !incomplete.subGoal; i++) {
        const g = props.goals[i];
        if (!g.completed) {
          incomplete.subGoal = g;
        }
      }
    }
  }

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
    incomplete.goal && h('div', { class: 'mb-2' }, [
      h('hr', { class: 'mb-2' }),
      h('div', { class: 'text-xs leading-none uppercase text-slate-600' }, text('Current Goal')),
      h('div', { class: '' }, [
        text(incomplete.goal.text),
        incomplete.subGoal && h('div', { class: 'ml-2' }, text(incomplete.subGoal.text.replace(subGoalRegex(), ''))),
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
