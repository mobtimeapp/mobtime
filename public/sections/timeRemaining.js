import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';

import { calculateTimeRemaining } from '/lib/calculateTimeRemaining.js';

import timerRemainingDisplay from '/formatTime.js';

import * as actions from '/actions.js';

export const timeRemaining = props => {
  const isPaused = props.timerStartedAt === null;
  const remainingTime = calculateTimeRemaining(props);

  return section({}, [
    h(
      'h2',
      {
        class: 'text-lg font-bold uppercase',
      },
      text('Timer'),
    ),

    h(
      'div',
      {
        class: 'flex flex-row items-center justify-between',
      },
      [
        h(
          'div',
          {
            class: 'flex flex-row items-center justify-start',
          },
          [
            h(
              'h3',
              {
                class: 'text-4xl font-extrabold leading-none mr-1 font-mono',
              },
              text(timerRemainingDisplay(remainingTime)),
            ),

            remainingTime > 0 &&
              button(
                {
                  size: 'md',
                  shadow: false,
                  onclick: state => {
                    return actions.Completed(state, {
                      isEndOfTurn: false,
                      documentElement: document,
                      Notification: window.Notification,
                    });
                  },
                },
                text('🛑 End Turn'),
              ),
          ],
        ),

        h('div', {}, [
          !props.timerDuration &&
            button(
              {
                class: {
                  'bg-green-800': true,
                  'text-gray-100': true,
                  'hover:bg-green-700': true,
                  'hover:text-gray-200': true,
                },
                onclick: state => {
                  return actions.StartTimer(state, {
                    timerStartedAt: Date.now(),
                    timerDuration: props.settings.duration,
                  });
                },
              },
              text('Begin Turn'),
            ),

          !!props.timerDuration &&
            button(
              {
                class: {
                  'bg-white': true,
                  'text-green-600': true,
                },
                disabled: !props.timerDuration,
                onclick: state => {
                  return isPaused
                    ? actions.ResumeTimer(state, Date.now())
                    : actions.PauseTimer(state, Date.now());
                },
              },
              [text(isPaused ? '👍 Resume' : '✋ Pause')],
            ),
        ]),
      ],
    ),
  ]);
};
