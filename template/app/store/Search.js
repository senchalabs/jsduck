/**
 * Store for keeping search results.
 */
Ext.define('Docs.store.Search', {
    extend: 'Ext.data.Store',

    fields: ['cls', 'member', 'type', 'doc'],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});