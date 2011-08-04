/**
 * Container for examples listing.
 */
Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.examplesindex',
    requires: [
        'Docs.view.ThumbList'
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
            fields: ['id', 'title', 'items'],
            data: catalog
        });

        var tpl = Ext.create('Ext.XTemplate',
            '<div id="sample-ct">',
                '<tpl for=".">',
                '<div><a name="{id}"></a><h2><div>{title}</div></h2>',
                '<dl>',
                    '<tpl for="items">',
                        '<dd ext:url="{url}"><img src="extjs/examples/shared/screens/{icon}"/>',
                            '<div><h4>{text}',
                                '<tpl if="status === \'new\'">',
                                    '<span class="new-sample"> (New)</span>',
                                '</tpl>',
                                '<tpl if="status === \'updated\'">',
                                    '<span class="updated-sample"> (Updated)</span>',
                                '</tpl>',
                                '<tpl if="status === \'experimental\'">',
                                    '<span class="new-sample"> (Experimental)</span>',
                                '</tpl>',
                            '</h4><p>{desc}</p></div>',
                        '</dd>',
                    '</tpl>',
                '<div style="clear:left"></div></dl></div>',
                '</tpl>',
            '</div>'
        );

        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Examples</h1>' },
            Ext.create('Docs.view.ThumbList', {
                tpl: tpl,
                store: store
            })
        ];

        this.callParent(arguments);
    }
});
