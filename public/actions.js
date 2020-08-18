import * as effects from './effects.js';

let initialNotificationPermission = '';
if (typeof window !== 'undefined' && 'Notification' in window) {
  initialNotificationPermission = Notification.permission;
}

export const Noop = (state) => state;

const emptyDrag = {
  active: false,
  type: null,
  from: null,
  to: null,
  clientX: null,
  clientY: null,
};

const emptyPrompt = {
  text: '',
  defaultValue: '',
  context: null,
  OnValue: Noop,
  visible: false,
};

const collectionMove = (collection, { from, to }) => {
  const newCollection = collection.reduce((memo, item, index) => {
    if (index === from) return memo;
    if (index === to) {
      return [
        ...memo,
        collection[from],
        item,
      ];
    }
    return [
      ...memo,
      item,
    ];
  }, []);
  if (to >= newCollection.length) {
    newCollection.push(collection[from]);
  }
  return newCollection;
};

export const Init = (_, timerId) => ({
  isOwner: false,
  timerStartedAt: null,
  timerDuration: 0,
  mob: [],
  goals: [],
  settings: {
    mobOrder: 'Navigator,Driver',
    duration: (5 * 60 * 1000),
  },
  expandedReorderable: null,
  timerTab: 'overview',
  drag: { ...emptyDrag },
  prompt: { ...emptyPrompt },
  timerId,
  remainingTime: 0,
  currentTime: null,
  name: '',
  goal: '',
  allowNotification: initialNotificationPermission === 'granted',
  allowSound: false,
  notificationPermissions: initialNotificationPermission,
  pendingSettings: {},
  websocket: null,
});

export const SetCurrentTime = (state, currentTime) => ({
  ...state,
  currentTime,
});

export const SetWebsocket = (state, { websocket }) => ({
  ...state,
  websocket,
});

export const ExpandReorderable = (state, { expandedReorderable }) => ({
  ...state,
  expandedReorderable,
});

export const PromptOpen = (state, {
  text,
  defaultValue,
  OnValue,
  context,
}) => ({
  ...state,
  prompt: {
    text,
    defaultValue,
    OnValue,
    context,
    visible: true,
  },
});

export const PromptOK = (state, { value }) => [
  {
    ...state,
    prompt: { ...emptyPrompt },
  },
  effects.andThen({
    action: state.prompt.OnValue,
    props: {
      ...state.prompt.context,
      value,
    },
  }),
];

export const PromptCancel = (state) => ({
  ...state,
  prompt: { ...emptyPrompt },
});

export const SetTimerTab = (state, timerTab) => ({
  ...state,
  timerTab,
});

export const DragSelect = (state, {
  type,
  from,
  clientX,
  clientY,
}) => ({
  ...state,
  drag: {
    active: false,
    type,
    from,
    to: null,
    clientX,
    clientY,
  },
});

export const DragMove = (state, {
  clientX,
  clientY,
}) => {
  if (!state.drag.active) {
    const diffX = state.drag.clientX - clientX;
    const diffY = state.drag.clientY - clientY;
    const distance = Math.sqrt((diffX * diffX) + (diffY * diffY));
    if (distance < 5) {
      return state;
    }
    return {
      ...state,
      drag: {
        ...state.drag,
        active: true,
        to: state.drag.from,
        clientX,
        clientY,
      },
    };
  }

  return {
    ...state,
    drag: {
      ...state.drag,
      active: true,
      clientX,
      clientY,
    },
  };
};

export const DragTo = (state, { to }) => ({
  ...state,
  drag: {
    ...state.drag,
    to,
  },
});

export const DragCancel = (state) => ({
  ...state,
  drag: { ...emptyDrag },
});

export const SetRemainingTime = (state, remainingTime) => [
  {
    ...state,
    remainingTime,
  },
  effects.UpdateTitleWithTime({ remainingTime }),
];

export const Completed = (state, { isEndOfTurn }) => {
  const nextState = {
    ...state,
    timerStartedAt: null,
    timerDuration: 0,
    remainingTime: 0,
  };

  const extraEffects = [];
  if (isEndOfTurn) {
    extraEffects.push(
      effects.Notify({
        notification: state.allowNotification,
        sound: state.allowSound,
        title: 'Mobtime',
        text: 'The timer is up!',
      }),
    );
  }

  if (isEndOfTurn && state.isOwner) {
    extraEffects.push(
      effects.andThen({
        action: CycleMob, // eslint-disable-line no-use-before-define
        props: {},
      }),
    );
  }

  return [
    nextState,
    [
      effects.UpdateTitleWithTime({ remainingTime: nextState.remainingTime }),
      effects.ShareTimer(nextState),
      ...extraEffects,
    ],
  ];
};

export const RenameUser = (state, { id, value }) => {
  const mob = state.mob.map((m) => ({
    ...m,
    name: m.id === id ? value : m.name,
  }));

  return [
    {
      ...state,
      mob,
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const RenameUserPrompt = (state, { id }) => {
  const user = state.mob.find((m) => m.id === id);
  if (!user) return state;

  return [
    state,
    effects.andThen({
      action: PromptOpen,
      props: {
        text: 'Rename Mob Member',
        defaultValue: user.name,
        OnValue: RenameUser,
        context: {
          id,
        },
      },
    }),
  ];
};

export const UpdateName = (state, name) => ({
  ...state,
  name,
});

export const ShuffleMob = (state) => {
  const mob = [...state.mob];
  for (let index = mob.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * index);
    const old = mob[index];
    mob[index] = mob[otherIndex];
    mob[otherIndex] = old;
  }

  return [
    {
      ...state,
      mob,
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const CycleMob = (state) => {
  const [first, ...rest] = state.mob;
  const mob = [...rest, first];

  return [
    {
      ...state,
      mob,
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const AddNameToMob = (state) => {
  const mob = state.mob.concat({
    id: Math.random().toString(36).slice(2),
    name: state.name,
  });

  return [
    {
      ...state,
      mob,
      name: '',
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const RemoveFromMob = (state, id) => {
  const mob = state.mob.filter((m) => m.id !== id);

  return [
    {
      ...state,
      mob,
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const MoveMob = (state, { from, to }) => {
  const mob = collectionMove(state.mob, { from, to });

  return [
    {
      ...state,
      mob,
    },
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];
};

export const AddGoal = (state) => {
  const goals = state.goals.concat({
    id: Math.random().toString(36).slice(2),
    text: state.goal,
    completed: false,
  });

  return [
    {
      ...state,
      goals,
      goal: '',
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals,
    }),
  ];
};
export const CompleteGoal = (state, { id, completed }) => {
  const goals = state.goals.map((g) => ({
    ...g,
    completed: g.id === id ? completed : g.completed,
  }));

  return [
    {
      ...state,
      goals,
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals,
    }),
  ];
};
export const RemoveGoal = (state, id) => {
  const goals = state.goals.filter((g) => g.id !== id);
  return [
    {
      ...state,
      goals,
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals,
    }),
  ];
};
export const MoveGoal = (state, { from, to }) => {
  const goals = collectionMove(state.goals, { from, to });

  return [
    {
      ...state,
      goals,
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals,
    }),
  ];
};

export const RenameGoal = (state, { id, value }) => {
  const goals = state.goals.map((g) => ({
    ...g,
    text: g.id === id ? value : g.text,
  }));
  return [
    {
      ...state,
      goals,
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals,
    }),
  ];
};
export const RenameGoalPrompt = (state, { id }) => {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return state;

  return [
    state,
    effects.andThen({
      action: PromptOpen,
      props: {
        text: 'Rename Goal',
        defaultValue: goal.text,
        OnValue: RenameGoal,
        context: {
          id,
        },
      },
    }),
  ];
};

export const UpdateGoalText = (state, goal) => [
  {
    ...state,
    goal,
  },
];

export const PauseTimer = (state) => [
  {
    ...state,
    timerStartedAt: null,
    timerDuration: state.remainingTime,
  },
  effects.UpdateTimer({
    websocket: state.websocket,
    timerStartedAt: null,
    timerDuration: state.remainingTime,
  }),
];

export const ResumeTimer = (state, timerStartedAt = Date.now()) => {
  const timerDuration = state.remainingTime;
  return [
    {
      ...state,
      timerStartedAt,
      timerDuration,
    },
    effects.UpdateTimer({
      websocket: state.websocket,
      timerStartedAt,
      timerDuration,
    }),
  ];
};

export const StartTimer = (state, timerStartedAt = Date.now()) => {
  const { duration: timerDuration } = state.settings;
  return [
    {
      ...state,
      timerStartedAt,
      timerDuration,
    },
    effects.UpdateTimer({
      websocket: state.websocket,
      timerStartedAt,
      timerDuration,
    }),
  ];
};

export const SetNotificationPermissions = (state, notificationPermissions) => [
  {
    ...state,
    notificationPermissions,
  },
];

export const RequestNotificationPermission = (state) => [
  state,
  effects.NotificationPermission({
    SetNotificationPermissions,
  }),
];

export const SetAllowNotification = (state, allowNotification) => ({
  ...state,
  allowNotification,
});

export const SetAllowSound = (state, allowSound) => [
  {
    ...state,
    allowSound,
  },
];

export const ShowNotification = (state, message) => [
  state,
  effects.DisplayNotification({
    title: 'Cycle Complete',
    text: message,
  }),
];

export const PendingSettingsReset = (state) => ({
  ...state,
  pendingSettings: {},
});

export const PendingSettingsSet = (state, { key, value }) => ({
  ...state,
  pendingSettings: {
    ...state.pendingSettings,
    [key]: value,
  },
});

export const UpdateSettings = (state) => {
  const settings = {
    ...state.settings,
    ...state.pendingSettings,
  };

  return [
    {
      ...state,
      settings,
      pendingSettings: {},
    },
    effects.UpdateSettings({
      websocket: state.websocket,
      settings,
    }),
  ];
};

export const BroadcastJoin = (state) => [
  state,
  effects.BroadcastJoin({
    websocket: state.websocket,
  }),
];

export const UpdateByWebsocketData = (state, payload) => {
  const { type, ...data } = payload;

  switch (type) {
    case 'settings:update':
      return {
        ...state,
        settings: data.settings,
      };

    case 'timer:update':
      return {
        ...state,
        timerStartedAt: data.timerStartedAt,
        timerDuration: data.timerDuration,
      };

    case 'timer:share':
      return {
        ...state,
        timerStartedAt: data.timerStartedAt,
        timerDuration: data.timerDuration,
        mob: data.mob,
        goals: data.goals,
        settings: data.settings,
        remainingTime: data.remainingTime,
      };

    case 'goals:update':
      return {
        ...state,
        goals: data.goals,
      };

    case 'mob:update':
      return {
        ...state,
        mob: data.mob,
      };

    case 'client:new':
      return [
        state,
        effects.ShareTimer(state),
      ];

    case 'timer:ownership':
      return {
        ...state,
        isOwner: data.isOwner,
      };

    default:
      console.warn('Unknown websocket data', payload); // eslint-disable-line no-console
      return state;
  }
};

export const DragEnd = (state) => {
  const badDrag = !state.drag.active
    || state.drag.to === null
    || state.drag.to === state.drag.from;

  if (badDrag) {
    return { ...state, drag: { ...emptyDrag } };
  }

  return [
    {
      ...state,
      drag: { ...emptyDrag },
    },
    state.drag.type === 'mob'
      ? effects.andThen({ action: MoveMob, props: state.drag })
      : effects.andThen({ action: MoveGoal, props: state.drag }),
  ];
};
