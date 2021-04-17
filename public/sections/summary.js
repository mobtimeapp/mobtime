import { h } from '/vendor/hyperapp.js';
import { participants } from './participants.js';
import { goals } from './goals.js';
import * as State from '../state.js';

export const summary = state => {
  const shared = State.getShared(state);
  const positions = (shared.positions || 'Lead').split(',');

  const members = State.getMob(state);
  const mob = Array.from(
    {
      length: Math.max(positions.length, members.length),
    },
    (_, index) => {
      const position = positions[index];
      const member = members[index] || {};

      return { ...member, position };
    },
  );

  return h(
    'div',
    {
      class: 'grid sm:grid-cols-2 gap-1',
    },
    [
      participants(mob),
      goals(
        {
          goals: State.getGoals(state),
        },
        positions,
      ),
    ],
  );
};
