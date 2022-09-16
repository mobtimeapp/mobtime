const nominclature = {
  group: 'Mob',
  individual: 'member',
  create: 'Add',
  edit: 'Edit',
};

const properCase = text =>
  text
    .split(' ')
    .map(word => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ');

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
    editGoals: `${nominclature.edit} Goals`,
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

  settings: {
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Saved',
    sharedTimerSettings: 'Shared Timer Settings',
    turnDurationInMinutes: 'Turn Duration (minutes)',
    mobRolesOrder: `${properCase(nominclature.individual)} Roles/Order`,
    positionHelpText: 'One or more comma separated list of positions',
    localSettings: 'Local Settings',
    enableTimerSounds: 'Enable timer sounds',
    test: 'Test',
    soundsProvidedBy: 'Sounds provided by',
    enableBrowserNotifications: 'Enable browser notifications',
    requestNotificationPermission: 'Request notification permission',
    enableDarkMode: 'Enable dark mode',
  },

  share: {
    scan: 'Scan this code to get the timer on your phone',
    mobtimePoweredByWebsockets: 'Mobtime is powered by websockets.',
    mobtimeCollaborate:
      'Share the URL to collaborate on the timer with your team',
  },

  toasts: {
    soundEffects: {
      title: 'Sound Effects',
      body:
        'You previously enabled sound effects, do you want to enable this time, too?',
      okay: 'Okay!',
      notNow: 'Not now',
      never: 'Never',
    },
    websocketDisconnect: {
      title: 'Lost Connection',
      reconnect: 'Reconnect!',
    },
  },
};
