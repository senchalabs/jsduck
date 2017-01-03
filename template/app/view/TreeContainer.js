/**
 * Container for all trees.
 * Note several Ti changes here to support multi-level guides tree.
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

    // For some strange reason the container gets a heading in Ext JS 4.1
    header: false,

    initComponent: function() {
        this.items = [
            {
                // An empty item that's initially activated.
                // We don't want to activate any of the trees when
                // they are hidden, as that will cause the scrollbar
                // to render improperly (or rather, not render at all)
            },
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
						// Ti -- added isObject
                        isObject: example.isObject,
                        url: '#!/example/' + example.url,
                        iconCls: 'icon-example'
                    };
                }
            },
            {
                // Ti -- added guidesgrouptree type
                xtype: 'guidesgrouptree',
                id: 'guidetree',
                data: Docs.data.guides,
                convert: function(guide) {
					// IE bug here - if you will uncomment at least one more attribute or add more guides - IE will start failing with stack overflow
                    var res = {
//                        leaf: false,
                        text: guide.title,
//                        expanded: true,
                        url: '#!/guide/' + guide.name,
                        iconCls: 'icon-guide'
                    };
                   	var self = arguments.callee;
                    if(typeof(guide.items) != 'undefined' &&  guide.items.length > 0){
                    	res.children = [];
                    	Ext.Array.each(guide.items, function(item){
                    		res.children.push(self(item));
                    	});
                    } else {
						res.leaf = true;
					}

                    return res;
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
                        url: '#!/video/' + video.name,
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
