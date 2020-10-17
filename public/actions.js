import * as effects from './effects.js';
import { calculateTimeRemaining } from './lib/calculateTimeRemaining.js';

let initialNotificationPermission = '';
if (typeof window !== 'undefined' && 'Notification' in window) {
  initialNotificationPermission = Notification.permission;
}

export const Noop = state => state;

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
  value: '',
  context: null,
  OnValue: Noop,
  visible: false,
};

const collectionMove = (collection, { from, to }) => {
  const newCollection = collection.reduce((memo, item, index) => {
    if (index === from) return memo;
    if (index === to) {
      return [...memo, collection[from], item];
    }
    return [...memo, item];
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
  breakTimerStartedAt: null,
  mob: [],
  goals: [],
  settings: {
    mobOrder: 'Navigator,Driver',
    duration: 5 * 60 * 1000,
    breaksEnabled: false,
    breakCadence: 45 * 60 * 1000,
  },
  expandedReorderable: null,
  timerTab: 'overview',
  drag: { ...emptyDrag },
  prompt: { ...emptyPrompt },
  timerId,
  currentTime: null,
  name: '',
  goal: '',
  addMultiple: false,
  allowNotification: initialNotificationPermission === 'granted',
  allowSound: false,
  notificationPermissions: initialNotificationPermission,
  pendingSettings: {},
  websocket: null,
});

export const SetAddMultiple = (state, addMultiple) => ({
  ...state,
  addMultiple: Boolean(addMultiple),
});

export const SetCurrentTime = (state, { currentTime, documentElement }) => {
  const nextState = {
    ...state,
    currentTime,
  };
  const remainingTime = calculateTimeRemaining(nextState);

  return [
    nextState,
    effects.UpdateTitleWithTime({
      remainingTime,
      documentElement,
    }),
  ];
};

export const SetWebsocket = (state, { websocket }) => ({
  ...state,
  websocket,
});

export const ExpandReorderable = (state, { expandedReorderable }) => ({
  ...state,
  expandedReorderable,
});

export const PromptOpen = (
  state,
  { text, defaultValue, OnValue, context },
) => ({
  ...state,
  prompt: {
    text,
    value: defaultValue,
    OnValue,
    context,
    visible: true,
  },
});

export const PromptValueChange = (state, value) => ({
  ...state,
  prompt: {
    ...state.prompt,
    value,
  },
});

export const PromptOK = state => [
  {
    ...state,
    prompt: { ...emptyPrompt },
  },
  effects.andThen({
    action: state.prompt.OnValue,
    props: {
      ...state.prompt.context,
      value: state.prompt.value,
    },
  }),
];

export const PromptCancel = state => ({
  ...state,
  prompt: { ...emptyPrompt },
});

export const SetTimerTab = (state, timerTab) => ({
  ...state,
  timerTab,
});

export const DragSelect = (state, { type, from, clientX, clientY }) => ({
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

export const DragMove = (state, { clientX, clientY }) => {
  if (!state.drag.active) {
    const diffX = state.drag.clientX - clientX;
    const diffY = state.drag.clientY - clientY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
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

export const DragCancel = state => ({
  ...state,
  drag: { ...emptyDrag },
});

export const EndTurn = (state, { documentElement, Notification }) => [
  {
    ...state,
    timerStartedAt: null,
    timerDuration: 0,
  },
  [
    effects.UpdateTitleWithTime({
      remainingTime: 0,
      documentElement,
    }),
    effects.Notify({
      notification: state.allowNotification,
      sound: state.allowSound,
      title: 'Mobtime',
      text: 'The timer is up!',
      Notification,
      documentElement,
    }),
  ],
];

export const Completed = (
  state,
  { isEndOfTurn, documentElement, Notification },
) => {
  const nextState = {
    ...state,
    timerStartedAt: null,
    timerDuration: 0,
  };

  const extraEffects = [];
  if (isEndOfTurn) {
    extraEffects.push(
      effects.andThen({
        action: EndTurn,
        props: {
          documentElement,
          Notification,
        },
      }),
    );
  }

  if (isEndOfTurn) {
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
      effects.CompleteTimer({
        websocket: state.websocket,
      }),
      ...extraEffects,
    ],
  ];
};

export const RenameUser = (state, { id, value }) => {
  const mob = state.mob.map(m => ({
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
  const user = state.mob.find(m => m.id === id);
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

export const ShuffleMob = state => {
  const mob = [...state.mob];
  for (let index = mob.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.round(Math.random() * index);
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

export const CycleMob = state => {
  if (state.mob.length === 0) {
    return state;
  }

  const [first, ...rest] = state.mob;
  const mob = [...rest, first];
  const shouldComplete = state.timerStartedAt > 0;

  const effectsToRun = [
    effects.UpdateMob({
      websocket: state.websocket,
      mob,
    }),
  ];

  if (shouldComplete) {
    effectsToRun.push(
      effects.andThen({
        action: Completed,
        props: { isEndOfTurn: true },
      }),
    );
  }

  return [
    {
      ...state,
      mob,
    },
    effectsToRun,
  ];
};

export const AddNameToMob = state => {
  const mob = state.mob.concat({
    id: Math.random()
      .toString(36)
      .slice(2),
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
  const mob = state.mob.filter(m => m.id !== id);

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

export const AddGoal = state => {
  const goals = state.goals.concat({
    id: Math.random()
      .toString(36)
      .slice(2),
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
export const AddGoals = (state, goals) => {
  const allGoals = state.goals.concat(
    goals
      .split('\n')
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .map(text => ({
        id: Math.random()
          .toString(36)
          .slice(2),
        text,
        completed: false,
      })),
  );

  return [
    {
      ...state,
      goals: allGoals,
      goal: '',
    },
    effects.UpdateGoals({
      websocket: state.websocket,
      goals: allGoals,
    }),
  ];
};

export const CompleteGoal = (state, { id, completed }) => {
  const goals = state.goals.map(g => ({
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
  const goals = state.goals.filter(g => g.id !== id);
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

export const RemoveCompletedGoals = state => {
  const incompleteGoals = state.goals.filter(g => !g.completed);
  const goalsAreRemoved = incompleteGoals.length < state.goals.length;
  return [
    {
      ...state,
      goals: incompleteGoals,
    },
    goalsAreRemoved
      ? effects.UpdateGoals({
          websocket: state.websocket,
          goals: incompleteGoals,
        })
      : undefined,
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
  const goals = state.goals.map(g => ({
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
  const goal = state.goals.find(g => g.id === id);
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

export const StartBreakTimer = state => {
  if (!state.settings.breaksEnabled) return [{ ...state }];
  if (state.breakTimerStartedAt !== null) return [{ ...state }];
  return [
    {
      ...state,
      breakTimerStartedAt: state.currentTime,
    },
    effects.StartBreakTimer({
      websocket: state.websocket,
    }),
  ];
};

export const FinishBreak = state => [
  {
    ...state,
    breakTimerStartedAt: null,
  },
  effects.FinishBreak({ websocket: state.websocket }),
];

export const PauseTimer = (state, currentTime = Date.now()) => {
  const elapsed = currentTime - state.timerStartedAt;
  const timerDuration = Math.max(0, state.timerDuration - elapsed);

  return [
    {
      ...state,
      timerStartedAt: null,
      timerDuration,
      currentTime,
    },
    effects.PauseTimer({
      websocket: state.websocket,
      timerDuration,
    }),
  ];
};

export const ResumeTimer = (state, timerStartedAt = Date.now()) => [
  {
    ...state,
    timerStartedAt,
    currentTime: timerStartedAt,
  },
  effects.StartTimer({
    websocket: state.websocket,
    timerDuration: state.timerDuration,
  }),
];

export const StartTimer = (state, { timerStartedAt, timerDuration }) => [
  {
    ...state,
    timerStartedAt,
    currentTime: timerStartedAt,
    timerDuration,
  },
  [
    effects.StartTimer({
      websocket: state.websocket,
      timerDuration,
    }),
    effects.andThen({
      action: StartBreakTimer,
    }),
  ],
];

export const SetAllowNotification = (
  state,
  { allowNotification, Notification, documentElement },
) => [
  {
    ...state,
    allowNotification,
  },
  allowNotification &&
    effects.Notify({
      title: 'Mobtime Config',
      text: 'You have allowed notifications',
      sound: false,
      Notification,
      documentElement,
    }),
];

export const SetNotificationPermissions = (
  state,
  { notificationPermissions, Notification, documentElement },
) => [
  {
    ...state,
    notificationPermissions,
  },
  notificationPermissions === 'granted' &&
    effects.andThen({
      action: SetAllowNotification,
      props: {
        allowNotification: true,
        Notification,
        documentElement,
      },
    }),
];

export const RequestNotificationPermission = (
  state,
  { Notification, documentElement },
) => [
  state,
  effects.NotificationPermission({
    SetNotificationPermissions,
    Notification,
    documentElement,
  }),
];

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

export const PendingSettingsReset = state => ({
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

export const UpdateSettings = state => {
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

export const BroadcastJoin = state => [
  state,
  effects.BroadcastJoin({
    websocket: state.websocket,
  }),
];

export const UpdateByWebsocketData = (
  state,
  { payload, documentElement, Notification },
) => {
  const { type, ...data } = payload;

  switch (type) {
    case 'settings:update':
      return {
        ...state,
        settings: data.settings,
      };

    case 'timer:start':
      return {
        ...state,
        timerStartedAt: Date.now(),
        timerDuration: data.timerDuration,
      };

    case 'timer:pause':
      return {
        ...state,
        timerStartedAt: null,
        timerDuration: data.timerDuration,
      };

    case 'timer:update':
      return {
        ...state,
        timerStartedAt: data.timerStartedAt,
        timerDuration: data.timerDuration,
      };

    case 'timer:complete':
      if (state.timerStartedAt === null) {
        return state;
      }

      return [
        state,
        effects.andThen({
          action: EndTurn,
          props: {
            Notification,
            documentElement,
          },
        }),
      ];

    case 'break:start-timer':
      return {
        ...state,
        breakTimerStartedAt: state.currentTime,
      };

    case 'break:finish':
      return {
        ...state,
        breakTimerStartedAt: null,
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
        [
          state.timerStartedAt > 0 &&
            effects.StartTimer({
              websocket: state.websocket,
              timerDuration: calculateTimeRemaining(state),
            }),
          effects.UpdateMob({ websocket: state.websocket, mob: state.mob }),
          effects.UpdateGoals({
            websocket: state.websocket,
            goals: state.goals,
          }),
          effects.UpdateSettings({
            websocket: state.websocket,
            settings: state.settings,
          }),
        ],
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

export const DragEnd = state => {
  const badDrag =
    !state.drag.active ||
    state.drag.to === null ||
    state.drag.to === state.drag.from;

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
