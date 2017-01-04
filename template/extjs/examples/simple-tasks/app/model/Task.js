Ext.define('SimpleTasks.model.Task', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'title' },
        { name: 'list_id', type: 'int' },
        { name: 'due', type: 'date'},
        { name: 'reminder', type: 'date' },
        { name: 'done', type: 'boolean', defaultValue: false },
        { name: 'note' }
    ],

    proxy: SimpleTasksSettings.useLocalStorage ? {
        type: 'localstorage',
        id: 'SimpleTasks-Task'
    } : {
        type: 'ajax',
        api: {
            create: 'php/task/create.php',
            read: 'php/task/read.php',
            update: 'php/task/update.php',
            destroy: 'php/task/delete.php'
        },
        reader: {
            type: 'json',
            root: 'tasks',
            messageProperty: 'message'
        }
    }

});