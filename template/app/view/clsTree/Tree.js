/**
 * The class tree
 */
Ext.define('Docs.view.clsTree.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.classtree',

    id: 'treePanelCmp',
    cls: 'iScroll',
    folderSort: true,
    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    dockedItems: [
        {
            xtype: 'container',
            layout: {
                type: 'hbox'
            },
            dock: 'top',
            margin: '0 0 15 0',
            items: [
                {
                    margin: '0 10 0 0',
                    xtype: 'button',
                    text: 'Favorites'
                },
                {
                    xtype: 'docshistorybutton'
                }
            ]
        }
    ],

    initComponent: function() {
        // Expand the main tree
        this.root.expanded = true;
        this.root.children[0].expanded = true;
        // Add links for favoriting classes
        this.addFavIcons(this.root);

        this.callParent();
    },

    addFavIcons: function(node) {
        if (node.isClass) {
            node.text += '<a rel="'+node.id+'" class="fav"></a>';
        }
        if (node.children) {
            Ext.Array.forEach(node.children, this.addFavIcons, this);
        }
    },

    /**
     * Selects class node in tree by name.
     *
     * @param {String} className
     */
    selectClass: function(className) {
        var classNode = this.getRootNode().findChildBy(function(n) {
            return className === n.raw.clsName;
        }, null, true);

        if (classNode) {
            this.getSelectionModel().select(classNode);
            classNode.bubble(function(n) {
                n.expand();
            });
        }
    }
});
