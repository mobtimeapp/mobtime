import * as effects from '/effects.js';
import Status from '/status.js';

const withToken = (fn, status) => Status.caseOf({
  Connecting: () => false,
  Connected: fn,
  Reconnecting: () => false,
  Error: () => false,
}, status);

let initialAllowNotification = false;
if ('Notification' in window) {
  initialAllowNotification = Notification.permission === 'granted';
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

export const Init = (_, timerId) => [
  {
    timerStartedAt: null,
    timerDuration: 0,
    mob: [],
    goals: [],
    lockedMob: null,
    connections: 0,
    settings: {
      mobOrder: '',
    },
    expandedReorderable: null,
    timerTab: 'overview',
    drag: { ...emptyDrag },
    prompt: { ...emptyPrompt },
    timerId,
    remainingTime: 0,
    name: '',
    goal: '',
    allowNotification: initialAllowNotification,
    status: Status.Connecting(),
    pendingSettings: {},
    websocket: null,
  },
];

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

// TODO: dragEndEffects
const dragEndEffects = {
  mob: (drag, status) => [
    withToken(
      (token) => effects.ApiEffect({
        endpoint: `/api/mob/move/${drag.from}/to/${drag.to}`,
        token,
        OnOK: Noop,
        OnERR: Noop,
      }),
      status,
    ),
  ],

  goal: (drag, status) => [
    withToken(
      (token) => effects.ApiEffect({
        endpoint: `/api/goals/move/${drag.from}/to/${drag.to}`,
        token,
        OnOK: Noop,
        OnERR: Noop,
      }),
      status,
    ),
  ],

  _: () => [],
};

export const DragEnd = (state) => {
  const badDrag = !state.drag.active
    || state.drag.to === null
    || state.drag.to === state.drag.from;

  const effectFn = (!badDrag && dragEndEffects[state.drag.type])
    || dragEndEffects._;

  return ([
    {
      ...state,
      drag: { ...emptyDrag },
    },
    effectFn(
      state.drag,
      state.status,
    ),
  ]);
};

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

export const SetStatus = (state, status) => ({ ...state, status });

// TODO: Tick
export const Tick = (state, serverState) => {
  const nextState = {
    ...state,
    serverState,
    remainingTime: serverState.timerStartedAt !== null
      ? Math.max(0, serverState.timerDuration - (Date.now() - serverState.timerStartedAt))
      : serverState.timerDuration,
  };

  const { remainingTime } = nextState;

  if (remainingTime === 0) {
    return [
      nextState,
      [
        effects.UpdateTitleWithTime({ remainingTime: 0 }),
      ],
    ];
  }

  return nextState;
};

export const Completed = (state) => [
  {
    ...state,
    timerStartedAt: null,
    timerDuration: null,
    remainingTime: 0,
  },
  [
    effects.UpdateTitleWithTime({ remainingTime: 0 }),
    // TODO: do this
    withToken(
      (token) => effects.ApiEffect({
        endpoint: '/api/timer/reset',
        token,
        OnOK: Noop,
        OnERR: Noop,
      }),
      state.status,
    ),
  ],
];
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

  return PromptOpen(state, {
    text: 'Rename Mob Member',
    defaultValue: user.name,
    OnValue: RenameUser,
    context: {
      id,
    },
  });
};

export const UpdateName = (state, name) => ({
  ...state,
  name,
});

export const ShuffleMob = (state) => {
  const mob = [...state.mob]; // FIXME: Shuffle

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

export const MoveMob = (state, { from, to }) => [
  {
    ...state,
  },
  dragEndEffects.mob({ from, to }, state.status),
];

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
export const MoveGoal = (state, { from, to }) => [
  {
    ...state,
  },
  dragEndEffects.goal({ from, to }, state.status),
];
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

  return PromptOpen(state, {
    text: 'Rename Goal',
    defaultValue: goal.text,
    OnValue: RenameGoal,
    context: {
      id,
    },
  });
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
  },
  effects.UpdateTimer({
    websocket: state.websocket,
    timerStarteAt: null,
    timerDuration: state.timerDuration,
  }),
];

// TODO: What
export const ResumeTimer = (state) => [
  state,
  effects.ResumeTimer({
    websocket: state.websocket,
  }),
];

export const StartTimer = (state) => {
  const timerStartedAt = Date.now();
  const { timerDuration } = state;
  return [
    {
      ...state,
      timerStartedAt,
      timerDuration,
    },
    effects.StartTimer({
      websocket: state.websocket,
      timerStartedAt,
      timerDuration,
    }),
  ];
};

export const SetAllowNotification = (state, allowNotification) => ({ ...state, allowNotification });

export const RequestNotificationPermission = (state) => [
  state,
  effects.NotificationPermission({
    SetAllowNotification,
  }),
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
