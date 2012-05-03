/**
 * Model for DocTest items
 */
Ext.define('Docs.model.DocTest', {
    extend: 'Ext.data.Model',
    fields: [
        'id',
        'name',
        'href',
        'code',
        'options',
        {name: 'status', defaultValue: 'ready'},
        'message'
    ]
});
