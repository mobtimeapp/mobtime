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
  ResetTimer: [String],

  AddUser: [String, String],
  RemoveUser: [String, String],

  LockMob: [String],
  UnlockMob: [String],

  ShuffleMob: [String],
  CycleMob: [String],
});
