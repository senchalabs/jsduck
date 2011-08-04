/**
 * Container for examples listing.
 */
Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.examplesindex',
    requires: [
        'Docs.view.examples.List'
    ],

    cls: 'all-demos iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        var catalog = Ext.samples.samplesCatalog;

        Ext.Array.forEach(catalog, function(c, i) {
            c.id = 'sample-' + i;
        });

        var store = Ext.create('Ext.data.JsonStore', {
            idProperty: 'id',
            fields: ['id', 'title', 'samples'],
            data: catalog
        });

        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Examples</h1>' },
            Ext.create('Docs.view.examples.List', {
                store: store
            })
        ];

        this.callParent(arguments);
    }
});
