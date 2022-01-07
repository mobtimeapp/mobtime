import * as actions from '/actions.js';
import { button } from '/components/button.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { goalList } from '/sections/goalList.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import { h, text } from '/vendor/hyperapp.js';

export const overview = props => {
  const locale = props.locale.tabs.overview;

  return h('div', {}, [
    overviewHeading(
      {
        rightAction: button(
          {
            type: 'button',
            onclick: () => [actions.SetTimerTab, 'mob'],
          },
          text(locale.editMob),
        ),
      },
      text(locale.whosUp),
    ),
    mobParticipants({
      overview: true,
      expandedReorderable: props.expandedReorderable,
      drag: {},
      mob: props.mob.slice(0, props.settings.mobOrder.split(',').length || 2),
      mobOrder: props.settings.mobOrder,
    }),

    overviewHeading(
      {
        rightAction: button(
          {
            type: 'button',
            onclick: () => [actions.SetTimerTab, 'goals'],
          },
          text(locale.editGoals),
        ),
      },
      text(locale.topGoals),
    ),
    goalList({
      overview: true,
      expandedReorderable: props.expandedReorderable,
      drag: {},
      goals: props.goals.filter(g => !g.completed).slice(0, 3),
    }),
  ]);
};
