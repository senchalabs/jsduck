/**
 * The class tree
 */
Ext.define('Docs.view.tree.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.classtree',

    id: 'treePanelCmp',
    cls: 'iScroll',
    folderSort: true,
    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {
        // Expand the main tree
        this.root.expanded = true;
        this.root.children[0].expanded = true;
        // Add links for favoriting classes
        // HACK: To do the favicons initialization after History store loaded.
        this.on("render", function() {
            Ext.getStore("Favorites").on("load", function() {
                this.getRootNode().cascadeBy(this.addFavIcons, this);
            }, this);
        }, this);

        this.dockedItems = [
            {
                xtype: 'container',
                layout: 'hbox',
                dock: 'top',
                margin: '0 0 15 0',
                items: [
                    {
                        xtype: 'menubutton',
                        id: 'favoritesBtn',
                        text: 'Favorites',
                        emptyText: 'No favorites',
                        store: Ext.getStore('Favorites'),
                        listeners: {
                            closeclick: function(cls) {
                                Docs.Favorites.remove(cls);
                            }
                        }
                    },
                    {
                        xtype: 'menubutton',
                        id: 'historyBtn',
                        text: 'History',
                        emptyText: 'No history',
                        store: Ext.getStore('History'),
                        listeners: {
                            closeclick: function(cls) {
                                Docs.History.removeClass(cls);
                            }
                        }
                    }
                ]
            }
        ];

        this.callParent();
    },

    addFavIcons: function(node) {
        if (node.get("leaf")) {
            var cls = node.raw.clsName;
            var show = Docs.Favorites.has(cls) ? "show" : "";
            node.set("text", node.get("text") + Ext.String.format('<a rel="{0}" class="fav {1}"></a>', cls, show));
            node.commit();
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
