/**
 * Container for all trees.
 */
Ext.define('Docs.view.TreeContainer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.treecontainer',
    requires: [
        'Docs.view.cls.Tree',
        'Docs.view.GroupTree'
    ],

    cls: 'iScroll',
    layout: 'card',
    resizable: true,
    resizeHandles: 'e',
    collapsible: true,
    hideCollapseTool: true,
    animCollapse: true,

    initComponent: function() {
        this.items = [
            {
                xtype: 'classtree',
                id: 'classtree',
                data: Docs.data.classes
            },
            {
                xtype: 'grouptree',
                id: 'exampletree',
                data: Docs.data.examples,
                convert: function(example) {
                    return {
                        leaf: true,
                        text: example.text,
                        url: '#!/example/' + example.url,
                        iconCls: 'icon-example'
                    };
                }
            },
            {
                xtype: 'grouptree',
                id: 'guidetree',
                data: Docs.data.guides,
                convert: function(guide) {
                    return {
                        leaf: true,
                        text: guide.title,
                        url: '#!/guide/' + guide.name,
                        iconCls: 'icon-guide'
                    };
                }
            },
            {
                xtype: 'grouptree',
                id: 'videotree',
                data: Docs.data.videos,
                convert: function(video) {
                    return {
                        leaf: true,
                        text: video.title,
                        url: '#!/video/' + video.id,
                        iconCls: 'icon-video'
                    };
                }
            }
        ];

        this.callParent();
    },

    /**
     * Shows the particular tree.
     *
     * @param {String} id  The id of the tree.
     */
    showTree: function(id) {
        this.show();
        this.layout.setActiveItem(id);
    }

});
