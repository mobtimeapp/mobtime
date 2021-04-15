import { h } from '/vendor/hyperapp.js';
import { participants } from './participants.js';
import { goals } from './goals.js';

export const summary = ({ mob, goals: mobGoals, settings }) => {
  const positions = (settings.mobOrder || 'Lead').split(',');
  const activeMob = mob.slice(0, positions.length);
  const passiveMob = mob.slice(positions.length);
  return h(
    'div',
    {
      class: 'grid sm:grid-cols-2 gap-1',
    },
    [
      participants(
        {
          activeMob,
          passiveMob,
        },
        positions,
      ),
      goals(
        {
          goals: mobGoals,
        },
        positions,
      ),
    ],
  );
};
