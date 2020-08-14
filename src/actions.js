import enumerize, { Any } from '@mrbarrysoftware/js-enumerize';

export default enumerize({
  Init: [],

  AddConnection: [Any, String],
  RemoveConnection: [Any],

  MessageTimer: [Any, String, Any],

});
