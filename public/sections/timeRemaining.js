import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';
import { deleteButton } from '/components/deleteButton.js';

import { calculateTimeRemaining } from '/lib/calculateTimeRemaining.js';

import timerRemainingDisplay from '/formatTime.js';
import * as actions from '/actions.js';

export const timeRemaining = (props) => {
  const isPaused = props.timerStartedAt === null;
  const remainingTime = calculateTimeRemaining(props);

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
          'flex': true,
          'flex-row': true,
          'items-start': true,
          'justify-start': true,
        },
      }, [
        h('span', {
          class: {
            'text-6xl': true,
            'font-extrabold': true,
            'leading-none': true,
          },
          style: {
            fontFamily: "'Working Sans', sans-serif",
          },
        }, timerRemainingDisplay(remainingTime)),
        remainingTime > 0 && h(deleteButton, {
          size: '24px',
          onclick: [actions.Completed, { isEndOfTurn: false }],
        }),
      ]),

      !props.timerDuration && [
        h(button, {
          class: {
            'bg-green-600': true,
            'text-white': true,
          },
          onclick: [
            actions.StartTimer,
            () => ({
              timerStartedAt: Date.now(),
              timerDuration: props.settings.duration,
            }),
          ],
        }, [
          h('i', {
            class: {
              'fas': true,
              'fa-play': true,
              'mr-4': true,
            },
          }),
          'Start Turn',
        ]),
      ],

      !!props.timerDuration && [
        h(button, {
          class: {
            'bg-white': true,
            'text-green-600': true,
          },
          disabled: !props.timerDuration,
          onclick: isPaused
            ? [actions.ResumeTimer, undefined]
            : [actions.PauseTimer, undefined],
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
      ],
    ]),
  ]);
};
