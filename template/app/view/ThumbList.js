// Temporary fix for IE10 before we upgrade to ExtJS 4.2.
// Without this clicking on the icons of ThumbList will show blank
// page as the code won't be able to extract the value of ext:url
// attribute.
//
// Patch taken from forum:
// http://www.sencha.com/forum/showthread.php?250267-Ext.Element.getAttribute-not-working-in-IE10
Ext.override(Ext.dom.Element, {
    getAttribute: (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) ?
        function (name, ns) {
            var d = this.dom,
                    type;
            if (ns) {
                type = typeof d[ns + ":" + name];
                if (type != 'undefined' && type != 'unknown') {
                    return d[ns + ":" + name] || null;
                }
                return null;
            }
            if (name === "for") {
                name = "htmlFor";
            }
            return d[name] || null;
        } : function (name, ns) {
            var d = this.dom;
            if (ns) {
                return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name);
            }
            return d.getAttribute(name) || d[name] || null;
        }
});

/**
 * View showing a list of clickable items with thumbnails.
 */
Ext.define('Docs.view.ThumbList', {
    extend: 'Ext.view.View',
    alias: 'widget.thumblist',
    requires: [
        'Docs.Comments'
    ],

    cls: 'thumb-list',
    itemSelector: 'dl',

    /**
     * @cfg
     * Name of the model field from which to read the URL for urlclick event.
     */
    urlField: 'url',

    /**
     * @cfg
     * The type to use for retrieving comment counts.
     * Should be either "guide" or "video".
     */
    commentType: "",

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

        // Listen to viewready because the whole HTML is not yet
        // rendered when afterrender fires - and initComments relies
        // on the view being rendered fully.
        this.on("viewready", function() {
            this.initHover();
            if (Docs.Comments.isEnabled()) {
                this.initComments();
            }
        }, this);

        this.callParent(arguments);
    },

    initHover: function() {
        this.getEl().on('mouseover', function(event, el) {
            Ext.get(el).addCls('over');
        }, this, {
            delegate: 'dd'
        });

        this.getEl().on('mouseout', function(event, el) {
            Ext.get(el).removeCls('over');
        }, this, {
            delegate: 'dd'
        });
    },

    initComments: function() {
        this.getEl().select("dd").each(function(dd) {
            var name = dd.getAttributeNS("ext", this.urlField).replace(/^.*\//, "");
            var count = Docs.Comments.getCount([this.commentType, name, ""]);
            if (count) {
                Ext.DomHelper.append(dd.down("p"), Docs.Comments.counterHtml(count));
            }
        }, this);
    },

    /**
     * Refreshes the comment counters.
     */
    updateCommentCounts: function() {
        if (!this.getEl()) {
            return;
        }

        this.getEl().select(".comment-counter-small").remove();
        this.initComments();
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
    // Eliminates the subgroups so we're left with just the first item
    // each subgroup:
    //
    // - group A
    //   - item 1 (titled as: subgroup AA)
    //   - item 3 (titled as: subgroup AB)
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
                items: Ext.Array.map(group.items, function(item) {
                    if (item.items) {
                        var groupItem = Ext.apply({}, expand(item)[0]);
                        groupItem.title = item.title;
                        return groupItem;
                    }
                    else {
                        return item;
                    }
                })
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
