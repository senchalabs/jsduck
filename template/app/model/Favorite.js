/**
 * Favorite classes
 */
Ext.define('Docs.model.Favorite', {
    fields: ['id', 'cls'],
    extend: 'Ext.data.Model',
    proxy: {
        type: 'localstorage',
        id  : 'docs-favorites'
    }
});
