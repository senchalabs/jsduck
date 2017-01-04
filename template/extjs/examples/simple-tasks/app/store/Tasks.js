Ext.define('SimpleTasks.store.Tasks', {
    extend: 'Ext.data.Store',
    model: 'SimpleTasks.model.Task',
    groupField: 'due'
});