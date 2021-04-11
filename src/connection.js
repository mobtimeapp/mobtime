import { id } from './id';

export const make = (websocket, timerId, isOwner = false) => ({
  id: id(),
  timerId,
  websocket,
  isOwner,
});
