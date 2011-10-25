/**
 * Container for examples listing.
 */
Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.exampleindex',
    requires: [
        'Docs.view.ThumbList'
    ],

    cls: 'iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {

        this.cls += Docs.touchExamplesUi ? " touch-examples-ui" : "";

        var touchExampleRoot = Docs.exampleBaseUrl || "touch/examples",
            extjsExampleRoot = Docs.exampleBaseUrl || "extjs/examples/",
            baseUrl = Docs.touchExamplesUi ? touchExampleRoot : (extjsExampleRoot + "shared/screens");

        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Examples</h1>' },
            Ext.create('Docs.view.ThumbList', {
                itemTpl: [
                    '<dd ext:url="#!/example/{url}">',
                        '<div class="thumb"><img src="'+baseUrl+'/{icon}"/></div>',
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
                    '</dd>'
                ],
                data: Docs.data.examples
            })
        ];

        this.callParent(arguments);
    },

    /**
     * Returns tab config for examples page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.data.examples.length > 0 ? {cls: 'examples', href: '#!/example', tooltip: 'Examples'} : false;
    }
});
