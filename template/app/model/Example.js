/**
 * Key-value pairs of Docs app settings.
 */
Ext.define('Docs.model.Example', {
    fields: ['id', 'primaryClass', 'referencesClasses', 'title', 'description', 'location'],
    extend: 'Ext.data.Model',
    proxy: {
        type: 'memory',
        id  : 'docs-examples'
    }
});
