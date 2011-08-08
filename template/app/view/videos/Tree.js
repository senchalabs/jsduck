/**
 * The videos tree
 */
Ext.define('Docs.view.videos.Tree', {
    extend: 'Docs.view.cls.Tree',
    alias: 'widget.videotree',

    initComponent: function() {
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
                    url: '/video/' + video.id,
                    iconCls: 'icon-video'
                });
            });

            this.root.children.push({
                text: group.title,
                children: children,
                iconCls: 'icon-pkg'
            });
        }, this);

        this.callParent();
    }
});
