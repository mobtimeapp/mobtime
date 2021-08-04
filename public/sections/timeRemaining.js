import { h, text } from '../vendor/hyperapp.js';

import { section } from '../components/section.js';
import { button } from '../components/button.js';

import timerRemainingDisplay from '../lib/formatTime.js';

import * as actions from '../actions.js';
import * as effects from '../effects.js';
import * as State from '../state.js';

import { withEvent, reactions } from '../lib/withEvent.js';

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
                  shadow: true,
                  size: 'md',
                  class: 'uppercase tracking-widest',
                  onclick: withEvent([
                    reactions.preventDefault(),
                    reactions.act(() => [actions.Completed]),
                    reactions.act([actions.EndTurn]),
                    reactions.fx(() =>
                      effects.CompleteTimer({
                        websocketPort: State.getWebsocketPort(state),
                      }),
                    ),
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
                shadow: true,
                size: 'md',
                color: 'indigo',
                class: 'uppercase tracking-widest',
                onclick: withEvent([
                  reactions.preventDefault(),
                  reactions.act(() => [actions.StartTimer, Date.now()]),
                  reactions.fx(() =>
                    effects.StartTimer({
                      websocketPort: State.getWebsocketPort(state),
                      timerDuration: State.getDuration(state),
                      timerStartedAt: Date.now(),
                    }),
                  ),
                ]),
              },
              text('Begin Turn'),
            ),

          !!duration &&
            isPaused &&
            button(
              {
                shadow: true,
                size: 'md',
                class: 'uppercase tracking-widest',
                disabled: !duration,
                onclick: withEvent([
                  reactions.preventDefault(),
                  reactions.act(() => [actions.ResumeTimer, Date.now()]),
                  reactions.fx(() =>
                    effects.StartTimer({
                      websocketPort: State.getWebsocketPort(state),
                      timerStartedAt: Date.now(),
                      timerDuration: State.getTimerRemainingDuration(state),
                    }),
                  ),
                ]),
              },
              [text('👍 Resume')],
            ),

          !!duration &&
            !isPaused &&
            button(
              {
                shadow: true,
                size: 'md',
                class: 'uppercase tracking-widest',
                disabled: !duration,
                onclick: withEvent([
                  reactions.preventDefault(),
                  reactions.act(() => [actions.PauseTimer, Date.now()]),
                  reactions.fx(() =>
                    effects.PauseTimer({
                      websocketPort: State.getWebsocketPort(state),
                      timerDuration: State.calculateTimeRemaining(
                        state,
                        Date.now(),
                      ),
                    }),
                  ),
                ]),
              },
              [text('✋ Pause')],
            ),
        ]),
      ],
    ),
  ]);
};
