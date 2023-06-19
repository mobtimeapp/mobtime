export const formatTime = milliseconds => {
  console.log('formatTime', milliseconds);
  if (!milliseconds) {
    return '00:00';
  }
  const minutes = Math.floor(milliseconds / 60000);
  const remainingMilliseconds = milliseconds - minutes * 60000;
  const seconds = Math.floor(remainingMilliseconds / 1000);

  return [minutes, seconds].map(t => `${t}`.padStart(2, '0')).join(':');
};

export const formattedTimeToMilliseconds = (formatted) => {
  if (!formatted) return 0;

  const [minutes, seconds] = formatted
    .split(':')
    .map((v) => parseInt(v));

  return (seconds + (minutes * 60)) * 1000;
};
