import { h, text } from '/vendor/hyperapp.js';
import { timeRemaining } from '/sections/timeRemaining.js';

export const timeSection = (props) => {
  return h('div', {
    class: 'md:col-span-2 grid grid-cols-2',
  }, [
    timeRemaining(props),
    h('div', {
      class: 'flex items-center justify-start',
    }, [
      h('ol', {}, [
        ...props.settings.mobOrder.split(',').map((position, index) => {
          return h('li', {}, [
            h('div', {}, text(position)),
            h('div', {}, text(props.mob[index]?.name || 'Empty')),
          ]);
        }),
      ]),
    ]),
  ]);
};
