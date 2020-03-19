import { app, effects } from 'ferp/src/ferp';
import * as bus from './bus';
import * as storage from './storage';
import Action from './actions';
import { Http } from './http';
import { CheckVersion } from './checkVersion';

const port = process.env.PORT || 4321;

const MessageBus = bus.make();
const Storage = storage.make();

const TickEffect = effects.thunk(() => {
  MessageBus.emit({ type: 'tick' });
  return effects.none();
});

const update = (action, state) => {
  return Action.caseOf({
    Init: () => [
      {
        data: {
          mob: [],
          timerStartedAt: null,
          timerDuration: 0,
        },
        tokens: [],
        lastTick: null,
      },
      CheckVersion(Action),
    ],

    AddToken: (token) => [
      {
        ...state,
        tokens: state.tokens.concat(token),
      },
      effects.none(),
    ],
    RemoveToken: (token) => [
      {
        ...state,
        tokens: state.tokens.filter(t => t !== token),
      },
      effects.none(),
    ],

    StartTimer: (milliseconds) => {
      const timerDuration = Math.max(0, milliseconds);
      const timerStartedAt = timerDuration > 0
        ? Date.now()
        : null;

      const nextState = {
        ...state,
        data: {
          ...state.data,
          timerStartedAt,
          timerDuration,
        },
      };
      return [
        nextState,
        effects.batch([
          TickEffect,
        ]),
      ];
    },

    PauseTimer: () => {
      let timerDuration = state.data.timerDuration;
      if (state.data.timerStartedAt !== null) {
        const elapsed = Date.now() - state.data.timerStartedAt;
        timerDuration = Math.max(0, state.data.timerDuration - elapsed);
      }

      return [
        {
          ...state,
          data: {
            ...state.data,
            timerStartedAt: null,
            timerDuration,
          },
        },
        TickEffect,
      ];
    },

    SyncTimer: () => {
      let timerStartedAt = state.data.timerStartedAt;
      let timerDuration = state.data.timerDuration;
      if (state.data.timerStartedAt !== null) {
        const elapsed = Date.now() - state.data.timerStartedAt;
        timerDuration = Math.max(0, state.data.timerDuration - elapsed);
      }
      if (timerDuration === 0) {
        timerStartedAt = null;
      }

      return [
        {
          ...state,
          data: {
            ...state.data,
            timerStartedAt,
            timerDuration,
          },
        },
        TickEffect,
      ];
    },

    AddUser: (name) => [
      { ...state,
        data: {
          ...state.data,
          mob: state.data.mob.concat(name),
        },
      },
      TickEffect,
    ],
    RemoveUser: (name) => [
      {
        ...state,
        data: {
          ...state.data,
          mob: state.data.mob.filter(n => n !== name),
        },
      },
      TickEffect,
    ],

    ShuffleMob: () => {
      let mob = [...state.data.mob];
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
          data: {
            ...state.data,
            mob,
          },
        },
        TickEffect,
      ];
    },

    CycleMob: () => {
      const [first, ...rest] = state.data.mob;
      return [
        {
          ...state,
          data: {
            ...state.data,
            mob: [...rest, first],
          },
        },
        TickEffect,
      ];
    },

    _: () => [state, effects.none()],
  }, action);
};

app({
  init: update(Action.Init(), {}),

  update,

  subscribe: state => {
    Storage.store(state);

    return [
      Http(
        MessageBus,
        Storage,
        Action,
        'localhost',
        port,
      ),
    ];
  },
});
