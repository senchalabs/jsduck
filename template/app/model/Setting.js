/**
 * Key-value pairs of Docs app settings.
 */
Ext.define('Docs.model.Setting', {
    fields: ['id', 'key', 'value'],
    extend: 'Ext.data.Model',
    proxy: {
        type: window['localStorage'] ? 'localstorage' : 'memory',
        id: Docs.data.localStorageDb + '-settings'
    }
});
