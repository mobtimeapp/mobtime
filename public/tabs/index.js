import * as actions from '/actions.js';
import { badge } from '/components/badge.js';
import { tab } from '/components/tab.js';
import { h, text } from '/vendor/hyperapp.js';

import { overview } from '/tabs/overview.js';
import { mob } from '/tabs/mob.js';
import { goals } from '/tabs/goals.js';
import { settings } from '/tabs/settings.js';
import { qrShare } from '/tabs/qrShare.js';

const getGoalsDetails = ({ goals }) => {
  const total = goals.length;

  if (total === 0) {
    return false;
  }

  const completed = goals.filter(g => g.completed).length;

  return badge({}, text(`${completed}/${total}`));
};


const tabMap = {
  overview,
  mob,
  goals,
  settings,
  share: qrShare,
};

const tabRenderer = (tabName, state) => (
  tabMap[tabName](state)
  || text(`Unable to load ${tabName} tab`)
);

export const tabs = (props) => h(
  'div',
  {
    class: {
      "flex": true,
      'flex-row': true,
      'flex-wrap': true,
      'px-2': true,
      'py-4': true,
      'sm:px-4': true,
    },
  },
  [
    tab(
      {
        selected: props.timerTab === 'overview',
        onclick: () => [actions.SetTimerTab, 'overview'],
      },
      text('Overview'),
    ),
    tab(
      {
        selected: props.timerTab === 'mob',
        onclick: () => [actions.SetTimerTab, 'mob'],
        details:
          props.mob.length > 0 &&
          badge({}, text(props.mob.length.toString())),
      },
      text('Mob'),
    ),
    tab(
      {
        selected: props.timerTab === 'goals',
        onclick: () => [actions.SetTimerTab, 'goals'],
        details: getGoalsDetails(props),
      },
      text('Goals'),
    ),
    tab(
      {
        selected: props.timerTab === 'settings',
        onclick: () => [actions.SetTimerTab, 'settings'],
      },
      text('Settings'),
    ),
    tab(
      {
        selected: props.timerTab === 'share',
        onclick: () => [actions.SetTimerTab, 'share'],
      },
      text('Share'),
    ),
  ],
);

export const showTab = (props) => tabRenderer(props.timerTab, props);
