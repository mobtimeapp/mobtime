import { h, text } from '/vendor/hyperapp.js';
import * as actions from '/actions.js';

export const details = (props, children) => h(
  'details',
  {
    open: props.details[props.which],
    ontoggle: (_, e) => {
      return [actions.DetailsToggle, { which: props.which, open: e.target.open }];
    },
  },
  [
    h('summary', {
      class: 'bg-transparent hover:bg-slate-200 hover:dark:bg-slate-600 text-xs text-slate-400 hover:text-slate-500 hover:dark:text-white px-1 cursor-pointer',
    }, text(props.summary)),
    ...([].concat(children)),
  ],
);
