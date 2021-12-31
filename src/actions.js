import { effects } from 'ferp';
import { CloseWebsocket, RelayMessage } from './websocket';
import * as Connection from './connection';
import { id, GenerateIdEffect } from './id';

const { none, act, batch, defer } = effects;

const defaultStatistics = {
  connections: 0,
  mobbers: 0,
};

const extractStatistics = message => {
  const { type, ...data } = JSON.parse(message);

  switch (type) {
    case 'mob:update':
      return { mobbers: data.mob.length };
    default:
      return {};
  }
};

export const Init = (queue, nextId = id()) => [
  {
    connections: [],
    queue,
    nextId,
  },
  none(),
];

export const SetNextId = nextId => state => [{ ...state, nextId }, none()];

export const UpdateStatisticsFromMessage = (timerId, message) => state => {
  return [
    state,
    defer(
      state.queue
        .mergeStatistics(timerId, stats => ({
          ...defaultStatistics,
          ...stats,
          ...extractStatistics(message),
        }))
        .then(() => none()),
    ),
  ];
};

export const UpdateConnectionStatistics = timerId => state => [
  state,
  defer(
    state.queue
      .mergeStatistics(timerId, stats => ({
        ...defaultStatistics,
        ...stats,
        connections: state.connections.filter(c => c.timerId === timerId)
          .length,
      }))
      .then(() => none()),
  ),
];

export const AddConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.concat(
      Connection.make(state.nextId, websocket, timerId),
    ),
  },
  batch([
    GenerateIdEffect(SetNextId),
    act(UpdateConnectionStatistics(timerId)),
    act(ShareTimerWith(websocket, timerId)),
  ]),
];

export const RemoveConnection = (websocket, timerId) => state => [
  {
    ...state,
    connections: state.connections.filter(c => c.websocket !== websocket),
  },
  batch([CloseWebsocket(websocket), act(UpdateConnectionStatistics(timerId))]),
];

export const UpdateTimer = (timerId, message) => state => {
  const { type, ...data } = JSON.parse(message);

  return [
    state,
    batch([
      defer(
        state.queue.mergeTimer(timerId, timer => ({
          ...timer,
          ...data,
        })),
      ),
      defer(
        state.queue
          .getTimer(timerId)
          .then(timer => act(MessageTimer(timerId, JSON.stringify(timer)))),
      ),
      act(UpdateStatisticsFromMessage, timerId, message),
    ]),
  ];
};

export const MessageTimer = (connections, timerId, message) => state => [
  state,
  effects.batch(
    state.connections
      .filter(c => c.timerId === timerId)
      .map(c => RelayMessage(c, message)),
  ),
];

export const ShareTimerWith = (websocket, timerId) => state => [
  state,
  effects.defer(
    state.queue
      .getTimer(timerId)
      .then(timer => {
        websocket.send(JSON.stringify(timer));
      })
      .then(none),
  ),
];
