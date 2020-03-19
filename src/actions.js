import enumerize from '@mrbarrysoftware/js-enumerize';

export default enumerize({
  Init: [],
  AddToken: [String],
  RemoveToken: [String],
  StartTimer: [Number],
  SyncTimer: [],
  PauseTimer: [],
  AddUser: [String],
  RemoveUser: [String],
  ShuffleMob: [],
  CycleMob: [],
  Noop: [],
});
