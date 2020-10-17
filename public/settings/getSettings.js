export const getSettings = (key, { pendingSettings, settings }) =>
  key in pendingSettings ? pendingSettings[key] : settings[key];
