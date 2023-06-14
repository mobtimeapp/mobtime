const nomenclature = {
  group: 'Span',
  individual: 'lid',
  create: 'Voeg by',
  edit: 'Wysig',
  product: 'mobtime',
};

const properCase = text =>
  text
    .split(' ')
    .map(word => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ');

export const af_ZA = {
  header: {
    product: nomenclature.product,
  },

  timeRemaining: {
    remainingTime: 'Oorblywende tyd',
    startTurn: 'Begin rondte',
    resume: 'Hervat',
    pause: 'Pouseer',
  },

  tabs: {
    overview: 'Oorsig',
    mob: nomenclature.group,
    goals: 'Doelwitte',
    settings: 'Verstellings',
    share: 'Deel',
  },

  overview: {
    whosUp: 'Volgende aan die beurt',
    editMob: `${nomenclature.edit} ${nomenclature.group}`,
    topGoals: 'Topdoelwitte',
    editGoals: 'Wysig doelwitte',
  },

  mob: {
    fallback: nomenclature.individual,
    rotate: 'Roteer',
    randomize: 'Lukrake orde',
    addPerson: 'Voeg \'n spanmaat by',
    add: nomenclature.create,
  },

  goals: {
    goodDay: 'Dit sal \'n goeie dag wees indien ons...',
    greatDay: 'Dit sal \'n uitsonderlike dag wees indien ons...',
    addSingle: 'Las \'n doelwit by',
    addMultiline: 'Voeg doelwitte by\n\'n Doelwit per lyn',
    addMultipleGoals: 'Voeg veelvuldige doelwitte by',
    add: nomenclature.create,
    clearCompleted: 'Ruim bereikte doelwitte op',
  },

  settings: {
    cancel: 'Kanselleer',
    save: 'Stoor',
    saved: 'Wysigings gestoor',
    sharedTimerSettings: 'Gedeelde tydaangeërverstellings',
    turnDurationInMinutes: 'Tydsduur per rondte, in minute',
    mobRolesOrder: 'Spanmaats: rol en volgorde',
    positionHelpText: 'Een of meer rolle geskei d.m.v. kommas',
    localSettings: 'Eie verstellings',
    enableTimerSounds: 'Aktiveer klankeffekte',
    test: 'Toets',
    soundsProvidedBy: 'Klankeffekte verskaf deur',
    enableBrowserNotifications: 'Aktiveer webblaaier kennisgewings',
    requestNotificationPermission: 'Versoek vergunning vir kennisgewings',
    enableDarkMode: 'Nagmodus',
  },

  share: {
    scan: 'Skandeer hierdie kode om die tydaangeër op u foon te laai.',
    mobtimePoweredByWebsockets: `${properCase(nomenclature.product)} maak gebruik van websockets.`,
    mobtimeCollaborate: 'Deel die webadres om saam met u spanmaats te werk.',
  },

  toasts: {
    soundEffects: {
      title: 'Klankeffekte',
      body:
        'U het vantevore klankeffekte geaktiveer - soek u klankeffekte tydens hierdie sessie ook?',
      okay: 'Asb!',
      notNow: 'Nie tans nie',
      never: 'Nooit weer nie',
    },
    websocketDisconnect: {
      title: 'Gebroke konneksie',
      reconnect: 'Herkonnekteer',
    },
  },
};
