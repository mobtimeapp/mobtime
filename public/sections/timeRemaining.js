import { h, text } from '../vendor/hyperapp.js';

import { section } from '../components/section.js';
import { button } from '../components/button.js';

import timerRemainingDisplay from '../formatTime.js';

import * as actions from '../actions.js';
import * as State from '../state.js';

const preventDefault = fn => {
  return (state, event) => {
    event.preventDefault();
    const [action, props] = fn(event);
    return action(state, props);
  };
};

export const timeRemaining = state => {
  const isPaused = State.isPaused(state);
  const remainingTime = State.timeRemainingFrom(state);
  const { timerDuration } = State.getTimer(state);

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
          !timerDuration &&
            button(
              {
                class: {
                  'bg-green-800': true,
                  'text-gray-100': true,
                  'hover:bg-green-700': true,
                  'hover:text-gray-200': true,
                },
                onclick: preventDefault(() => [
                  actions.StartTimerAndShare,
                  Date.now(),
                ]),
              },
              text('Begin Turn'),
            ),

          !!timerDuration &&
            button(
              {
                class: {
                  'bg-white': true,
                  'text-green-600': true,
                },
                disabled: !timerDuration,
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
