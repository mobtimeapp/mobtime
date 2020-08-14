import enumerize from '@mrbarrysoftware/js-enumerize';

export default enumerize({
    Init: [],
    AddConnection: [
        enumerize.Any,
        String,
        Boolean,
    ],
    RemoveConnection: [enumerize.Any]
});
