import { app, effects } from 'ferp/src/ferp';
import * as bus from './bus';
import * as storage from './storage';
import Action from './actions';
import { Http } from './http';
import { Timer } from './timer';

const port = process.env.PORT || 4321;

const MessageBus = bus.make();
const Storage = storage.make();

const TickEffect = effects.thunk(() => {
  MessageBus.emit({ type: 'tick' });
  return effects.none();
});

const CompleteEffect = effects.thunk(() => {
  MessageBus.emit({ type: 'complete' });
  return effects.none();
});

const update = (action, state) => {
  return Action.caseOf({
    Init: () => [
      {
        data: {
          mob: [],
          timerRemaining: 0,
          timerRunning: false,
        },
        tokens: [],
        lastTick: null,
      },
      effects.none(),
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
      const timerRemaining = Math.max(0, milliseconds);
      const nextState = {
        ...state,
        data: {
          ...state.data,
          timerRemaining,
          timerRunning: timerRemaining > 0,
        },
        lastTick: Date.now(),
      };
      return [
        nextState,
        effects.batch([
          TickEffect,
          Timer(Action.TickTimer),
        ]),
      ];
    },

    TickTimer: () => {
      const now = Date.now();
      const diff = state.lastTick
        ? now - state.lastTick
        : 0;
      const timerRemaining = Math.max(0, state.data.timerRemaining - diff);
      const timerRunning = state.data.timerRunning
        ? timerRemaining > 0
        : false;

      const isComplete = state.data.timerRunning && timerRemaining === 0;

      const nextState = {
        ...state,
        data: {
          ...state.data,
          timerRemaining,
          timerRunning,
        },
        lastTick: now,
      };

      return [
        nextState,
        effects.batch([
          TickEffect,
          ...(timerRunning ? [Timer(() => Action.TickTimer())] : []),
          ...(isComplete ? [Action.DoneTimer()] : []),
        ]),
      ];
    },

    PauseTimer: () => [
      {
        ...state,
        data: {
          ...state.data,
          timerRunning: false,
        },
      },
      TickEffect,
    ],

    DoneTimer: () => [
      state,
      CompleteEffect,
    ],

    AddUser: (name) => [
      {
        ...state,
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
