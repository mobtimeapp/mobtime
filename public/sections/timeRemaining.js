import { h } from 'https://unpkg.com/hyperapp?module=1';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import timerRemainingDisplay from '/formatTime.js';
import * as actions from '/actions.js';

export const timeRemaining = (props) => {
  const isPaused = props.serverState.timerStartedAt === null;

  return h(section, null, [
    h('h2', {
      class: {
        'text-lg': true,
        'font-bold': true,
        'uppercase': true,
      },
    }, 'Remaining Time'),

    h('div', {
      class: {
        'flex': true,
        'flex-row': true,
        'items-center': true,
        'justify-between': true,
      },
    }, [
      h('h3', {
        class: {
          'text-6xl': true,
          'font-extrabold': true,
        },
      }, timerRemainingDisplay(props.remainingTime)),

      h(button, {
        class: {
          'bg-white': true,
          'text-green-600': true,
        },
        disabled: !props.serverState.timerDuration,
        onclick: isPaused
          ? actions.ResumeTimer
          : actions.PauseTimer,
      }, [
        h('i', {
          class: {
            'fas': true,
            'fa-pause': !isPaused,
            'fa-play': isPaused,
            'mr-4': true,
          },
        }),
        isPaused ? 'Resume' : 'Pause',
      ]),
    ]),
  ]);
};
