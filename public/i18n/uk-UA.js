const nominclature = {
  group: 'Моб',
  individual: 'учасник',
  create: 'Додати',
  edit: 'Змінити',
};

const properCase = text =>
  text
    .split(' ')
    .map(word => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ');

export const uk_UA = {
  header: {
    product: 'mobtime',
  },

  timeRemaining: {
    remainingTime: 'Залишок часу',
    startTurn: 'Почати',
    resume: 'Продовжити',
    pause: 'Зупинити',
  },

  tabs: {
    overview: 'Огляд',
    mob: nominclature.group,
    goals: 'Цілі',
    settings: 'Налаштування',
    share: 'Поділитися',
  },

  overview: {
    whosUp: 'Хто далі',
    editMob: `${nominclature.edit} ${nominclature.group}`,
    topGoals: 'Поточні цілі',
    editGoals: `${nominclature.edit} Цілі`,
  },

  mob: {
    fallback: nominclature.individual,
    rotate: 'Наступний учасник',
    randomize: 'Перемішати',
    addPerson: `${nominclature.create} учасника`,
    add: nominclature.create,
  },

  goals: {
    goodDay: 'Щоб досягнути гарного дня треба...',
    greatDay: 'Щоб досягнути чудового дня треба...',
    addSingle: `${nominclature.create} ціль`,
    addMultiline: `${nominclature.create} ціль\nКожну ціль з нової лінії`,
    addMultipleGoals: `${nominclature.create} декілька цілей`,
    add: nominclature.create,
    clearCompleted: 'Видалити досягнуті цілі',
  },

  settings: {
    cancel: 'Відмінити',
    save: 'Зберегти',
    saved: 'Збережено',
    sharedTimerSettings: 'Налаштування таймеру',
    turnDurationInMinutes: 'Довжина ротації (у хвилинах)',
    mobRolesOrder: 'Ролі/Порядок учасників',
    positionHelpText: 'Одна або більше ролей розділених комами',
    localSettings: 'Локальні налаштування',
    enableTimerSounds: 'Увімкнути звуки таймеру',
    test: 'Проткстувати',
    soundsProvidedBy: 'Звуки запроваджено',
    enableBrowserNotifications: 'Увімкнути повідомлення браузера',
    requestNotificationPermission: 'Запросити дозвіл на показ повідомлень',
    enableDarkMode: 'Увімкнути темну тема',
  },

  share: {
    scan: 'Відскануй цей код, щоб переглянути цей таймер на телефоні',
    mobtimePoweredByWebsockets: 'Mobtime використовує вебсокети.',
    mobtimeCollaborate:
      'Поділись посиланням на цю сторінку та користуйся таймером разом зі своєю командою',
  },

  toasts: {
    soundEffects: {
      title: 'Звукові Ефекти',
      body:
        'Раніше ви вже вмикали звукові ефекти, хочете ввімкнути й цього разу?',
      okay: 'Ок!',
      notNow: 'Не зараз',
      never: 'Ніколи',
    },
    websocketDisconnect: {
      title: 'Підключення втрачено',
      reconnect: 'Під\'єднатися!',
    },
  },
};
