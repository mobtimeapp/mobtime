import { h, text } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';
import { button } from '/components/button.js';
import { deleteButton } from '/components/deleteButton.js';

import { calculateTimeRemaining } from '/lib/calculateTimeRemaining.js';

import timerRemainingDisplay from '/formatTime.js';
import * as actions from '/actions.js';

export const timeRemaining = props => {
  const isPaused = props.timerStartedAt === null;
  const remainingTime = calculateTimeRemaining(props);

  const elapsed = props.timerStartedAt
    ? props.currentTime - props.timerStartedAt
    : 0;
  const percent = elapsed > 0 && props.timerDuration > 0
    ? (elapsed / props.timerDuration) * 4
    : 0;
  const pulse = (Math.floor(elapsed / 1000) % 2) === 0;

  if (elapsed > 0) {
    console.log({ elapsed, percent, duration: props.timerDuration, pulse });
  }

  // border-t-slate-500
  // border-r-slate-500
  // border-b-slate-500
  // border-l-slate-500

  return section({
    // class: { 'md:col-span-2': true },
  }, [

    h(
      'div',
      {
        class: {
          'flex': true,
          'flex-col': true,
          'items-center': true,
          'justify-center': true,
          'outline': true,
          'outline-indigo-400': true,
          'border-t-4': percent > 0,
          'border-t-transparent': percent > 0 && pulse,
          'border-t-blue-300': percent > 0 && !pulse,
          'border-r-4': percent > 1,
          'border-r-transparent': percent > 0 && pulse,
          'border-r-blue-300': percent > 0 && !pulse,
          'border-b-4': percent > 2,
          'border-b-transparent': percent > 0 && pulse,
          'border-b-blue-300': percent > 0 && !pulse,
          'border-l-4': percent > 3,
          'border-l-transparent': percent > 0 && pulse,
          'border-l-blue-300': percent > 0 && !pulse,
          'w-52': true,
          'h-52': true,
          'rounded-full': true,
          // 'mx-auto': true,
          'mb-8': true,
          'transition-all': true,
          'duration-1000': true,
          'ease-in-out': true,
        },
      },
      [
        h(
          'h2',
          {
            class: {
              'text-sm': true,
              'font-bold': true,
              'uppercase': true,
            },
          },
          text(props.lang.timeRemaining.remainingTime),
        ),

        h(
          'h3',
          {
            class: {
              'flex': true,
              'flex-row': true,
              'items-start': true,
              'justify-start': true,
            },
          },
          [
            h(
              'span',
              {
                class: {
                  'text-6xl': true,
                  // 'font-extrabold': true,
                  'leading-none': true,
                },
                style: {
                  fontFamily: "'Working Sans', sans-serif",
                },
              },
              text(timerRemainingDisplay(remainingTime)),
            ),
            remainingTime > 0 &&
              deleteButton({
                size: '24px',
                onclick: () => [
                  actions.Completed,
                  {
                    isEndOfTurn: false,
                    documentElement: document,
                    Notification: window.Notification,
                  },
                ],
              }),
          ],
        ),
      ],
    ),

    h(
      'div',
      {
        class: {
          'flex': true,
          'flex-col': true,
          'items-center': true,
          'justify-center': true,
        },
      },
      [

        //

        !props.timerDuration &&
          button(
            {
              class: {
                'bg-green-600': true,
                'text-white': true,
              },
              onclick: () => [
                actions.StartTimer,
                {
                  timerStartedAt: Date.now(),
                  timerDuration: props.settings.duration,
                },
              ],
            },
            [
              h('i', {
                class: {
                  'fas': true,
                  'fa-play': true,
                  'mr-4': true,
                },
              }),
              text(props.lang.timeRemaining.startTurn),
            ],
          ),

        !!props.timerDuration &&
          button(
            {
              class: {
                'bg-white': true,
                'text-green-600': true,
              },
              disabled: !props.timerDuration,
              onclick: isPaused
                ? [actions.ResumeTimer, undefined]
                : [actions.PauseTimer, undefined],
            },
            [
              h('i', {
                class: {
                  'fas': true,
                  'fa-pause': !isPaused,
                  'fa-play': isPaused,
                  'mr-4': true,
                },
              }),
              text(
                isPaused
                  ? props.lang.timeRemaining.resume
                  : props.lang.timeRemaining.pause,
              ),
            ],
          ),
      ],
    ),
  ]);
};
