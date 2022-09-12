import * as actions from '/actions.js';
import { button } from '/components/button.js';
import { overviewHeading } from '/components/overviewHeading.js';
import { goalList } from '/sections/goalList.js';
import { mobParticipants } from '/sections/mobParticipants.js';
import { h, text } from '/vendor/hyperapp.js';

export const overview = props =>
  h('div', {}, [
    overviewHeading(
      {
        rightAction: button(
          {
            type: 'button',
            onclick: () => [actions.SetTimerTab, 'mob'],
          },
          text(props.lang.overview.editMob),
        ),
      },
      text(props.lang.overview.whosUp),
    ),
    mobParticipants({
      overview: true,
      expandedReorderable: props.expandedReorderable,
      drag: {},
      mob: props.mob.slice(0, props.settings.mobOrder.split(',').length || 2),
      mobOrder: props.settings.mobOrder,
      lang: props.lang,
    }),

    overviewHeading(
      {
        rightAction: button(
          {
            type: 'button',
            onclick: () => [actions.SetTimerTab, 'goals'],
          },
          text(props.lang.overview.editGoals),
        ),
      },
      text(props.lang.overview.topGoals),
    ),
    goalList({
      overview: true,
      expandedReorderable: props.expandedReorderable,
      drag: {},
      goals: props.goals.filter(g => !g.completed).slice(0, 3),
      lang: props.lang,
    }),
  ]);
