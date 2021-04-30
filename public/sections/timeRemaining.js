import { h, text } from '../vendor/hyperapp.js';

import { section } from '../components/section.js';
import { button } from '../components/button.js';

import timerRemainingDisplay from '../lib/formatTime.js';

import * as actions from '../actions.js';
import * as State from '../state.js';

import { preventDefault } from '../lib/preventDefault.js';

export const timeRemaining = state => {
  const isPaused = State.isPaused(state);
  const remainingTime = State.timeRemainingFrom(state);
  const duration = State.getTimerRemainingDuration(state);

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
                  class: 'uppercase tracking-widest',
                  onclick: preventDefault(() => [
                    actions.CompletedAndShare,
                    { isEndOfTurn: false },
                  ]),
                },
                text('🛑 End Turn'),
              ),
          ],
        ),

        h('div', {}, [
          !duration &&
            button(
              {
                size: 'md',
                color: 'green',
                class: 'uppercase tracking-widest',
                onclick: preventDefault(() => [
                  actions.StartTimerAndShare,
                  Date.now(),
                ]),
              },
              text('Begin Turn'),
            ),

          !!duration &&
            button(
              {
                size: 'md',
                class: 'uppercase tracking-widest',
                disabled: !duration,
                onclick: preventDefault(() =>
                  isPaused
                    ? [actions.ResumeTimerAndShare, Date.now()]
                    : [actions.PauseTimerAndShare, Date.now()],
                ),
              },
              [text(isPaused ? '👍 Resume' : '✋ Pause')],
            ),
        ]),
      ],
    ),
  ]);
};
