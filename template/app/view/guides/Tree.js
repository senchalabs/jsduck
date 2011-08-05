/**
 * The guides tree
 */
Ext.define('Docs.view.guides.Tree', {
    extend: 'Docs.view.cls.Tree',
    alias: 'widget.guidestree',

    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when link in tree was clicked on and needs to be loaded.
             * @param {String} url  URL of the guide to load
             * @param {Ext.EventObject} e
             */
            "guideclick"
        );

        this.root = {
            allowDrag: false,
            children: [],
            text: 'Guides'
        };

        Ext.Array.each(Docs.guides, function(group) {
            var children = Ext.Array.map(group.items, function(guide) {
                return {
                    leaf: true,
                    text: guide.title,
                    url: '/guide/' + guide.name,
                    iconCls: 'icon-guide'
                };
            });

            this.root.children.push({
                text: group.title,
                children: children,
                iconCls: 'icon-pkg'
            });
        }, this);

        this.on("itemclick", this.onItemClick, this);

        this.callParent();
    },

    onItemClick: function(view, node, item, index, e) {
        var url = node.raw.url;

        if (url) {
            this.fireEvent('guideclick', url, e);
        }
        else if (!node.isLeaf()) {
            if (node.isExpanded()) {
                node.collapse(false);
            }
            else {
                node.expand(false);
            }
        }
    }
});
