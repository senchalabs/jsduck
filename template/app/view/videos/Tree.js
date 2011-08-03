/**
 * The examples tree
 */
Ext.define('Docs.view.videos.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.videostree',

    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {

        this.addEvents(
            /**
             * @event
             * Fired when link in tree was clicked on and needs to be loaded.
             * @param {String} url  URL of the example to load
             * @param {Ext.EventObject} e
             */
            "videoclick"
        );

        this.root = {
            allowDrag: false,
            children: [],
            text: 'Videos'
        };

        Ext.Array.each(Docs.videos, function(group) {

            var children = Ext.Array.map(group.videos, function(video) {
                return Ext.apply(video, {
                    leaf: true,
                    text: video.title,
                    url: '/videos/' + video.id
                });
            });

            this.root.children.push({
                text: group.group,
                children: children
            })
        }, this);

        this.on("itemclick", this.onItemClick, this);

        this.callParent();
    },

    onItemClick: function(view, node, item, index, e) {

        var url = node.raw.id;

        if (url) {
            this.fireEvent('videoclick', id, e)
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
