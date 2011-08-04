/**
 * View showing a list of examples.
 */
Ext.define('Docs.view.examples.List', {
    extend: 'Ext.view.View',
    alias: 'widget.samplepanel',

    cls: 'demos',
    itemSelector: 'dl',

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when an example is clicked
             * @param {String} url  URL of the example to load
             */
            'exampleclick'
        );

        this.tpl = Ext.create('Ext.XTemplate',
            '<div id="sample-ct">',
                '<tpl for=".">',
                '<div><a name="{id}"></a><h2><div>{title}</div></h2>',
                '<dl>',
                    '<tpl for="samples">',
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

        this.on({
            'afterrender': function(cmp) {
                cmp.el.addListener('mouseover', function(evt, el) {
                    Ext.get(el).addCls('over');
                }, this, {
                    delegate: 'dd'
                });
                cmp.el.addListener('mouseout', function(evt, el) {
                    Ext.get(el).removeCls('over');
                }, this, {
                    delegate: 'dd'
                });
            }
        });

        this.callParent(arguments);
    },

    onContainerClick: function(e) {
        var group = e.getTarget('h2', 3, true);

        if (group) {
            group.up('div').toggleCls('collapsed');
        }
    },

    onItemClick : function(record, item, index, e){
        var t = e.getTarget('dd', 5, true);

        if (t && !e.getTarget('a', 2)) {
            var url = t.getAttributeNS('ext', 'url');
            this.fireEvent('exampleclick', url);
        }

        return this.callParent(arguments);
    }
});
