Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias : 'widget.examplesindex',
    autoScroll : true,

    cls : 'all-demos',
    margin: '10 0 0 0',

    initComponent: function() {

        var catalog = Ext.samples.samplesCatalog;

        for (var i = 0, c; c = catalog[i]; i++) {
            c.id = 'sample-' + i;
        }

        var store = Ext.create('Ext.data.JsonStore', {
            idProperty : 'id',
            fields     : ['id', 'title', 'samples'],
            data       : catalog
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
