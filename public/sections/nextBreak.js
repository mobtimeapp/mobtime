import { h } from '/vendor/hyperapp.js';

import { section } from '/components/section.js';

import timerRemainingDisplay from '/formatTime.js';

export const nextBreak = ({
  breakTimerStartedAt,
  currentTime,
  breakCadence,
}) => {
  if (breakTimerStartedAt === null) {
    return h(section, {}, [
      h(
        'div',
        {
          class: {
            'tracker-widest': true,
            'text-2xl': true,
          },
        },
        'Start turn to schedule next break.',
      ),
    ]);
  }
  const remainingTime = breakTimerStartedAt - currentTime + breakCadence;
  if (remainingTime < 0) {
    return h(section, {}, [
      h(
        'div',
        {
          class: {
            'tracker-widest': true,
            'text-2xl': true,
          },
        },
        'Break after next rotation.',
      ),
    ]);
  }

  return h(section, {}, [
    h(
      'span',
      {
        class: {
          'text-4xl': true,
          'font-extrabold': true,
          'leading-none': true,
        },
        style: {
          fontFamily: "'Working Sans', sans-serif",
        },
      },
      timerRemainingDisplay(remainingTime),
    ),
  ]);
};
