Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias : 'widget.examplesindex',
    autoScroll : true,

    cls : 'all-demos',

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
            Ext.create('Docs.view.examples.List', {
                store: store
            })
        ];

        this.callParent(arguments);
    }
});
