import enumerize from 'https://unpkg.com/@mrbarrysoftware/js-enumerize?module=1'; // eslint-disable-line import/no-unresolved

export default enumerize({
  Connecting: [],
  Connected: [String],
  Reconnecting: [Number],
  Error: [String],
});
