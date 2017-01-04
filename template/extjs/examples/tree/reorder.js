Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.tip.*'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    var store = Ext.create('Ext.data.TreeStore', {
        proxy: {
            type: 'ajax',
            url: 'get-nodes.php'
        },
        root: {
            text: 'Ext JS',
            id: 'src',
            expanded: true
        },
        folderSort: true,
        sorters: [{
            property: 'text',
            direction: 'ASC'
        }]
    });

    var tree = Ext.create('Ext.tree.Panel', {
        store: store,
        viewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop'
            }
        },
        renderTo: 'tree-div',
        height: 300,
        width: 250,
        title: 'Files',
        useArrows: true,
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                text: 'Expand All',
                handler: function(){
                    tree.getEl().mask('Expanding tree...');
                    var toolbar = this.up('toolbar');
                    toolbar.disable();
                    
                    tree.expandAll(function() {
                        tree.getEl().unmask();
                        toolbar.enable();
                    });
                }
            }, {
                text: 'Collapse All',
                handler: function(){
                    var toolbar = this.up('toolbar');
                    toolbar.disable();
                    
                    tree.collapseAll(function() {
                        toolbar.enable();
                    });
                }
            }]
        }]
    });
});
