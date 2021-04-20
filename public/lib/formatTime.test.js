import test from 'ava';
import formatTime from './formatTime';

test('displays 00:00 with empty milliseconds', t => {
  const expectedTime = '00:00';
  t.is(formatTime(), expectedTime);
});

test('displays under-a-minute time', t => {
  const expectedTime = '00:59';
  t.is(formatTime(59000), expectedTime);
});

test('displays under 10-minute time', t => {
  const expectedTime = '09:00';
  t.is(formatTime(9 * 60 * 1000), expectedTime);
});

test('displays over 10-minute time', t => {
  const expectedTime = '99:00';
  t.is(formatTime(99 * 60 * 1000), expectedTime);
});
