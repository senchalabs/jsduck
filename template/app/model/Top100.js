/**
 * Store for top 100 most visited classes.
 */
Ext.define('Docs.model.Top100', {
    fields: ['id', 'cls'],
    extend: 'Ext.data.Model',
    proxy: {
        type: ('localStorage' in window && window['localStorage'] !== null) ? 'localstorage' : 'memory',
        id  : 'docs-top100'
    }
});
