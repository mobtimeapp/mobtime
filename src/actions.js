import enumerize from '@mrbarrysoftware/js-enumerize';

export default enumerize({
  Init: [],
  AddToken: [String],
  RemoveToken: [String],
  StartTimer: [Number],
  TickTimer: [],
  PauseTimer: [],
  DoneTimer: [],
  AddUser: [String],
  RemoveUser: [String],
  ShuffleMob: [],
  CycleMob: [],
});
