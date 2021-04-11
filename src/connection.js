export const make = (id, websocket, timerId, isOwner = false) => ({
  id,
  timerId,
  websocket,
  isOwner,
});
