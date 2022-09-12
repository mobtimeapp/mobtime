const nominclature = {
  group: 'Mob',
  individual: 'member',
  create: 'Add',
  edit: 'Edit',
};

export const en_CA = {
  header: {
    product: 'mobtime',
  },

  timeRemaining: {
    remainingTime: 'Remaining Time',
    startTurn: 'Start Turn',
    resume: 'Resume',
    pause: 'Pause',
  },

  tabs: {
    overview: 'Overview',
    mob: nominclature.group,
    goals: 'Goals',
    settings: 'Settings',
    share: 'Share',
  },

  overview: {
    whosUp: "Who's up",
    editMob: `${nominclature.edit} ${nominclature.group}`,
    topGoals: 'Top Goals',
    editGoals: '${nominclature.edit} Goals',
  },

  mob: {
    fallback: nominclature.individual,
    rotate: 'Rotate',
    randomize: 'Randomize',
    addPerson: `${nominclature.create} ${nominclature.individual}`,
    add: nominclature.create,
  },

  goals: {
    goodDay: 'A good day would be...',
    greatDay: 'A great day would be...',
    addSingle: `${nominclature.create} goal`,
    addMultiline: `${nominclature.create} goals\nOne goal per line`,
    addMultipleGoals: `${nominclature.create} multiple goals`,
    add: nominclature.create,
    clearCompleted: 'Clear completed goals',
  },
};
