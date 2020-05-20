import { id } from '../id';

export default (timer) => ({
  ...timer,
  mob: timer.mob.map((m) => (
    typeof m === 'string'
      ? { name: m, id: id() }
      : m
  )),
});
