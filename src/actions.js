import enumerize from '@mrbarrysoftware/js-enumerize';

export default enumerize({
  Init: [],
  AddTimer: [String],
  PingTimer: [String],
  RemoveTimer: [String],
  AddToken: [String, String],
  RemoveToken: [String, String],
  StartTimer: [Number, String],
  SyncTimer: [String],
  PauseTimer: [String],
  AddUser: [String, String],
  RemoveUser: [String, String],
  ShuffleMob: [String],
  CycleMob: [String],
});
