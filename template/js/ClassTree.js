
Ext.define('Docs.ClassTree', {
    extend: 'Ext.tree.Panel',

    id: 'treePanelCmp',
    cls: 'iScroll',
    renderTo: 'treePanel',
    folderSort: true,
    useArrows: true,

    height: Ext.core.Element.getViewportHeight() - 170,
    border: false,
    bodyBorder: false,
    padding: '0 0 0 20',

    listeners: {
        itemclick: function(view, node) {
            var clsName = node.raw ? node.raw.clsName : node.data.clsName;

            if (clsName) {
                getDocClass(clsName);
            } else if (!node.isLeaf()) {
                if (node.isExpanded()) {
                    node.collapse(false);
                } else {
                    node.expand(false);
                }
            }
        },
        render: function() {
            var self = this;
            setTimeout(function() {
                self.selectCurrentClass();
            }, 500);
        }
    },

    selectCurrentClass: function() {
        var treePanel = Ext.getCmp('treePanelCmp');

        if (req.docClass != 'undefined') {
            var classNode = Ext.getCmp('treePanelCmp').getRootNode().findChildBy(function(n) {
                return req.docClass == n.raw.clsName;
            }, null, true);

            if (classNode) {
                treePanel.getSelectionModel().select(classNode);
                classNode.bubble(function(n) {
                    n.expand();
                });
            }
        }
    }
});
