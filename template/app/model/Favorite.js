/**
 * Favorite classes
 */
Ext.define('Docs.model.Favorite', {
    fields: ['id', 'url', 'title'],
    extend: 'Ext.data.Model',
    proxy: {
        type: ('localStorage' in window && window['localStorage'] !== null) ? 'localstorage' : 'memory',
        id  : 'docs-favorites'
    }
});
