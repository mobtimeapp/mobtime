import { EXPIRE_TIMER } from '../timerConfig';

const migrateSettings = (settings = {}) => ({
  ...settings,
  duration: settings.duration || ((5 * 60 * 1000) + 900),
});

export default (timer) => ({
  ...timer,
  mob: timer.mob || [],
  lockedMob: timer.lockedMob || null,
  timerStartedAt: timer.timerStartedAt || null,
  timerDuration: timer.timerDuration || 0,
  goals: timer.goals || [],
  tokens: [],
  expiresAt: timer.expiresAt || (Date.now() + EXPIRE_TIMER),
  settings: migrateSettings(timer.settings),
});
