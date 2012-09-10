/**
 * View showing a list of clickable items with thumbnails.
 */
Ext.define('Docs.view.ThumbList', {
    extend: 'Ext.view.View',
    alias: 'widget.thumblist',

    cls: 'thumb-list',
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

    /**
     * @cfg {Object[]} data (required)
     * The data to display in this view. Each object represents one group:
     * @cfg {String} data.title The name for the group.
     * @cfg {Object[]} data.items The items inside the group.
     */

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when an item in list is clicked.
             * @param {String} url  URL of the item to load
             */
            'urlclick'
        );

        // Generate ID-s for data
        Ext.Array.forEach(this.data, function(c, i) {
            c.id = 'sample-' + i;
        });

        this.store = Ext.create('Ext.data.JsonStore', {
            fields: ['id', 'title', 'items']
        });


        // Can't just pass the #data config to store as in Ext 4.1 the
        // value of data config gets modified - each array element
        // gets replaced with a Model record.
        //
        // But we don't want to modify the items in the global
        // Docs.data...
        this.store.loadData(this.flattenSubgroups(this.data));

        // Place itemTpl inside main template
        this.tpl = new Ext.XTemplate(Ext.Array.flatten([
            '<div>',
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
        // Hide itemTpl and data configs from parent class
        this.itemTpl = undefined;
        this.data = undefined;

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

    // Given groups data with subgroups like this:
    //
    // - group A
    //   - subgroup AA
    //     - item 1
    //     - item 2
    //   - subgroup AB
    //     - item 3
    //     - item 4
    // - group B
    //   - item 5
    //
    // Eliminates the subgroups so we're left with:
    //
    // - group A
    //   - item 1
    //   - item 2
    //   - item 3
    //   - item 4
    // - group B
    //   - item 5
    //
    flattenSubgroups: function(data) {
        function expand(item) {
            if (item.items) {
                return Ext.Array.map(item.items, expand);
            }
            else {
                return item;
            }
        }

        return Ext.Array.map(data, function(group) {
            return {
                id: group.id,
                title: group.title,
                items: Ext.Array.flatten(Ext.Array.map(group.items, expand))
            };
        });
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
