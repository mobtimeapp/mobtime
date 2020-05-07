import { app, effects } from 'ferp';
import * as bus from './bus';
import * as storage from './storage';
import Action from './actions';
import { Http } from './http';
import { CheckVersion } from './checkVersion';
import { Cleanup } from './cleanup';
import AuditLogEffect from './auditLog';

import { TokenPoliceEffect } from './tokenPolice';
import { BlacklistEffect } from './blacklist';

import { LoadEffect } from './load';
import { Persist } from './persistence';

const port = process.env.PORT || 4321;

const EXPIRE_TIMER = 30 * 60 * 1000; // 30 minutes

const MessageBus = bus.make();
const Storage = storage.make();

const TickEffect = timerId => effects.thunk(() => {
  MessageBus.emit({ type: 'tick', timerId });
  return effects.none();
});

const NotificationEffect = (message, timerId) => effects.thunk(() => {
  MessageBus.emit({ type: 'notify', message, timerId });
  return effects.none();
});

const NotifyBreakEffect = timerId => NotificationEffect(
  'Maybe take a 5-10 minute break',
  timerId,
);

const NotifyTimeUpEffect = timerId => NotificationEffect(
  'The time is up, cycle and start a new timer',
  timerId,
);

const update = (action, state) => {
  if (!action) return [state, effects.none()];

  return Action.caseOf({
    Init: () => [
      {},
      effects.batch([
        CheckVersion(Action),
        LoadEffect(Action),
      ]),
    ],

    Load: (newState) => [
      newState,
      effects.none(),
    ],

    AddTimer: (timerId) => {
      const timerExists = !!state[timerId];

      const timer = state[timerId] || {
        mob: [],
        lockedMob: null,
        timerStartedAt: null,
        timerDuration: 0,
        goals: [],
        tokens: [],
        expiresAt: Date.now() + EXPIRE_TIMER,
      };

      return [
        {
          ...state,
          [timerId]: timer,
        },
        timerExists
          ? effects.none()
          : AuditLogEffect(null, null, 'AddTimer', timerId),
      ];
    },

    PingTimer: (_token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        console.log('PingTimer: timer not found', timerId);
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            expiresAt: Date.now() + EXPIRE_TIMER,
          },
        },
        TickEffect(timerId),
      ];
    },

    RemoveTimer: (timerId) => {
      const { [timerId]: _oldTimer, ...timers } = state;
      return [
        {
          ...timers,
        },
        AuditLogEffect(null, null, 'RemoveTimer', timerId),
      ];
    },

    AddToken: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            tokens: timer.tokens.concat(token),
          },
        },
        effects.batch([
          AuditLogEffect(timerId, null, 'AddToken', token),
          TokenPoliceEffect(
            timerId,
            BlacklistEffect,
          ),
        ]),
      ];
    },

    RemoveToken: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            tokens: timer.tokens.filter(t => t !== token),
          },
        },
        AuditLogEffect(timerId, null, 'RemoveToken', token),
      ];
    },

    StartTimer: (milliseconds, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const timerDuration = Math.max(0, milliseconds);
      const timerStartedAt = timerDuration > 0
        ? Date.now()
        : null;

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            timerDuration,
            timerStartedAt,
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'StartTimer', milliseconds.toString()),
        ]),
      ];
    },

    PauseTimer: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      let timerDuration = timer.timerDuration;
      if (timer.timerStartedAt !== null) {
        const elapsed = Date.now() - timer.timerStartedAt;
        timerDuration = Math.max(0, timer.timerDuration - elapsed);
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            timerStartedAt: null,
            timerDuration,
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'PauseTimer'),
        ]),

      ];
    },

    ResetTimer: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      if (timer.timerStartedAt === null && timer.timerDuration === 0) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            timerStartedAt: null,
            timerDuration: 0,
          },
        },
        effects.batch([
          NotifyTimeUpEffect(timerId),
          AuditLogEffect(timerId, token, 'ResetTimer'),
          Action.CycleMob(token, timerId),
        ]),
      ];
    },

    AddUser: (name, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob: timer.mob.concat(name),
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'AddUser', name),
        ]),
      ];
    },

    RemoveUser: (name, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob: timer.mob.filter(n => n !== name),
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'RemoveUser', name),
        ]),
      ];
    },

    MoveUser: (sourceIndex, destinationIndex, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const clamp = index => Math.min(timer.mob.length, Math.max(0, index));

      const clampedSourceIndex = clamp(sourceIndex);
      const clampedDestinationIndex = clamp(destinationIndex);

      if (clampedSourceIndex === clampedDestinationIndex) {
        return [state, effects.none()];
      }

      const mobber = timer.mob[clampedSourceIndex];

      const mob = timer.mob.reduce((nextMob, oldMobber, index) => {
        if (index === clampedSourceIndex) return nextMob;

        return (index === destinationIndex)
          ? [...nextMob, mobber, oldMobber]
          : [...nextMob, oldMobber];
      }, []);

      if (clampedDestinationIndex >= mob.length) {
        mob.push(timer.mob[clampedSourceIndex]);
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob,
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'MoveUser', { sourceIndex, destinationIndex }),
        ]),
      ]
      
    },

    AddGoal: (text, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const goal = timer.goals.find(g => g.text === text);
      if (goal) {
        return [state, effects.none()];
      }

      const id = Math.random().toString(36).slice(2);

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            goals: [
              ...timer.goals,
              { id, text, completed: false },
            ],
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'AddGoal', text),
        ]),
      ];
    },

    CompleteGoal: (goalId, completed, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const goalIndex = timer.goals.findIndex(g => g.id === goalId || g.text === goalId);
      if (goalIndex === -1) {
        return [state, effects.none()];
      }

      const goals = [...timer.goals];
      goals[goalIndex].completed = completed;

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            goals,
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'CompleteGoal', { text, completed }),
        ]),
      ];
    },
    RemoveGoal: (goalId, token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            goals: timer.goals.filter(g => g.id !== goalId || g.text !== goalId),
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'RemoveGoal', text),
        ]),
      ];
    },

    LockMob: (_token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            lockedMob: [...timer.mob],
          },
        },
        TickEffect(timerId),
      ];
    },
    UnlockMob: (_token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            lockedMob: null,
          },
        },
        TickEffect(timerId),
      ];
    },

    ShuffleMob: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      let mob = [...timer.mob];
      let index, otherIndex, temp;
      for(index = mob.length - 1; index > 0; index--) {
        otherIndex = Math.floor(Math.random() * (index + 1));
        temp = mob[index];
        mob[index] = mob[otherIndex];
        mob[otherIndex] = temp;
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob,
          },
        },
        effects.batch([
          TickEffect(timerId),
          AuditLogEffect(timerId, token, 'ShuffleMob'),
        ]),
      ];
    },

    CycleMob: (token, timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const [first, ...rest] = timer.mob;
      const mob = [...rest, first];

      const isCycleComplete = timer.lockedMob
        ? mob.every((v, i) => v === timer.lockedMob[i])
        : false;

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob,
          },
        },
        effects.batch([
          TickEffect(timerId),
          isCycleComplete
            ? NotifyBreakEffect(timerId)
            : effects.none(),
          AuditLogEffect(timerId, token, 'CycleMob'),
        ]),
      ];
    },
  }, action);
};

app({
  init: update(Action.Init(), {}),

  update,

  subscribe: state => {
    Storage.store(state);

    const anyTimers = Object.keys(state).length > 0;

    return [
      Http(
        MessageBus,
        Storage,
        Action,
        'localhost',
        port,
      ),
      anyTimers && Cleanup(Storage, Action),
      Persist(Storage),
    ];
  },
});
