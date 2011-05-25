/**
 * Previously visited classes / guides
 */
Ext.define('Docs.model.History', {
    fields: ['id', 'cls'],
    extend: 'Ext.data.Model',
    proxy: {
        type: 'localstorage',
        id  : 'docs-history'
    }
});
