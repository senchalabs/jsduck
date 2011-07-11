/**
 * Favorite classes
 */
Ext.define('Docs.model.Favorite', {
    fields: ['id', 'url', 'title', 'cls'],
    extend: 'Ext.data.Model',
    proxy: {
        type: ('localStorage' in window && window['localStorage'] !== null) ? 'localstorage' : 'memory',
        id: Docs.localStorageDb + '-favorites'
    }
});
