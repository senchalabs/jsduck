/**
 * The videos tree
 */
Ext.define('Docs.view.videos.Tree', {
    extend: 'Docs.view.cls.Tree',
    alias: 'widget.videostree',

    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when link in tree was clicked on and needs to be loaded.
             * @param {String} url  URL of the video to load
             * @param {Ext.EventObject} e
             */
            "videoclick"
        );

        this.root = {
            allowDrag: false,
            children: [],
            text: 'Videos'
        };

        Ext.Array.each(Docs.data.videos, function(group, idx) {
            var children = Ext.Array.map(group.items, function(video) {
                return Ext.apply(video, {
                    leaf: true,
                    text: video.title,
                    url: '/videos/' + video.id,
                    iconCls: 'icon-video'
                });
            });

            this.root.children.push({
                expanded: idx == 0,
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
            this.fireEvent('videoclick', url, e);
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
