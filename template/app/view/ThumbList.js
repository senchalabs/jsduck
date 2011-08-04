/**
 * View showing a list of clickable items with thumbnails.
 */
Ext.define('Docs.view.ThumbList', {
    extend: 'Ext.view.View',
    alias: 'widget.thumblist',

    cls: 'demos',
    itemSelector: 'dl',

    /**
     * @cfg
     * Name of the model field from which to read the URL for urlclick event.
     */
    urlField: 'url',

    /**
     * @cfg {String[]} itemTpl
     * The template to use for rendering a single item.
     * The template should create a single `<dd>` element.
     */
    itemTpl: [],

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when an item in list is clicked.
             * @param {String} url  URL of the item to load
             */
            'urlclick'
        );

        this.tpl = new Ext.XTemplate(Ext.Array.flatten([
            '<div id="sample-ct">',
                '<tpl for=".">',
                '<div><a name="{id}"></a><h2><div>{title}</div></h2>',
                '<dl>',
                    '<tpl for="items">',
                        this.itemTpl,
                    '</tpl>',
                '<div style="clear:left"></div></dl></div>',
                '</tpl>',
            '</div>'
        ]));
        // Hide itemTpl config from parent class
        this.itemTpl = undefined;

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
            var url = t.getAttributeNS('ext', this.urlField);
            this.fireEvent('urlclick', url);
        }

        return this.callParent(arguments);
    }
});
