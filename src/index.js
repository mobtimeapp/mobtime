import { app, effects } from 'ferp/src/ferp';
import * as bus from './bus';
import * as storage from './storage';
import Action from './actions';
import { Http } from './http';
import { CheckVersion } from './checkVersion';
import { Cleanup } from './cleanup';

const port = process.env.PORT || 4321;

const EXPIRE_TIMER = 30 * 60 * 1000; // 30 minutes

const MessageBus = bus.make();
const Storage = storage.make();

const TickEffect = timerId => effects.thunk(() => {
  MessageBus.emit({ type: 'tick', timerId });
  return effects.none();
});

const update = (action, state) => {
  return Action.caseOf({
    Init: () => [
      {},
      CheckVersion(Action),
    ],

    AddTimer: (timerId) => {
      const timer = state[timerId] || {
        mob: [],
        timerStartedAt: null,
        timerDuration: 0,
        tokens: [],
        expiresAt: Date.now() + EXPIRE_TIMER,
      };

      const thing = state[timerId]
        ? 'Reusing'
        : 'Adding';

      return [
        {
          ...state,
          [timerId]: timer,
        },
        effects.none(),
      ];
    },

    PingTimer: (timerId) => {
      const timer = state[timerId];
      if (!timer) {
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
      return [
        {
          ...state,
          [timerId]: undefined,
          },
          effects.none(),
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
        effects.none(),
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
        effects.none(),
      ];
    },

    StartTimer: (milliseconds, timerId) => {
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
        ]),
      ];
    },

    SyncTimer: (timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      let timerStartedAt = timer.timerStartedAt;
      let timerDuration = timer.timerDuration;
      if (timer.timerStartedAt !== null) {
        const elapsed = Date.now() - timer.timerStartedAt;
        timerDuration = Math.max(0, timer.timerDuration - elapsed);
      }
      if (timerDuration === 0) {
        timerStartedAt = null;
      }

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            timerStartedAt,
            timerDuration,
          },
        },
        TickEffect(timerId),
      ];
    },

    PauseTimer: (timerId) => {
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
        TickEffect(timerId),
      ];
    },

    AddUser: (name, timerId) => {
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
        TickEffect(timerId),
      ];
    },

    RemoveUser: (name, timerId) => {
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
        TickEffect(timerId),
      ];
    },

    ShuffleMob: (timerId) => {
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
        TickEffect(timerId),
      ];
    },

    CycleMob: (timerId) => {
      const timer = state[timerId];
      if (!timer) {
        return [state, effects.none()];
      }

      const [first, ...rest] = timer.mob;

      return [
        {
          ...state,
          [timerId]: {
            ...timer,
            mob: [...rest, first],
          },
        },
        TickEffect(timerId),
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
        !process.env.MULTITIMER,
      ),
      anyTimers && Cleanup(Storage, Action),
    ];
  },
});
