/**
 * Model for statistics per class.
 */
Ext.define('Docs.model.Stats', {
    extend: 'Ext.data.Model',
    fields: [
        'name',
        'members',
        'localMembers',
        'fanIn',
        'fanOut',
        'wordCount'
    ]
});
