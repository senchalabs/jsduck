/**
 * The base tree class for classes/guides/videos/examples.
 */
Ext.define('Docs.view.DocTree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.doctree',

    cls: 'doc-tree iScroll',
    useArrows: true,
    rootVisible: false,

    border: false,
    bodyBorder: false,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when link in tree was clicked on and needs to be loaded.
             * @param {String} url  URL of the page to load
             * @param {Ext.EventObject} e
             */
            "urlclick"
        );

        // Expand the main tree
        this.root.expanded = true;
        if (this.root.children[0]) {
            this.root.children[0].expanded = true;
        }

        this.on("itemclick", this.onItemClick, this);
        this.on("beforeitemcollapse", this.handleBeforeExpandCollapse, this);
        this.on("beforeitemexpand", this.handleBeforeExpandCollapse, this);

        this.callParent();

        // Make all nodes into HTML links, so that middle-clicking on
        // them will work cross-browser.
        // Do this after callParent, because the getRootNode() will
        // work after initComponent has run.
        this.nodeTpl = new Ext.XTemplate(
            '<a href="{url}" rel="{url}">{text}</a>'
        );
        this.initNodeLinks();
    },

    initNodeLinks: function() {
        this.getRootNode().cascadeBy(this.applyNodeTpl, this);
    },

    applyNodeTpl: function(node) {
        if (node.get("leaf")) {
            node.set("text", this.nodeTpl.apply({
                text: node.get("text"),
                url: node.raw.url
            }));
            node.commit();
        }
    },

    onItemClick: function(view, node, item, index, e) {
        var url = node.raw ? node.raw.url : node.data.url;

        if (url) {
            this.fireEvent("urlclick", url, e);
        }
        else if (!node.isLeaf()) {
            if (node.isExpanded()) {
                node.collapse(false);
            }
            else {
                node.expand(false);
            }
        }
    },

    /**
     * Selects link node in tree by URL.
     *
     * @param {String} url
     */
    selectUrl: function(url) {
        var r = this.findRecordByUrl(url);
        if (r) {
            r.bubble(function(n) {
                n.expand();
            });
            this.getSelectionModel().select(r);
        }
        else {
            this.getSelectionModel().deselectAll();
        }
    },

    findRecordByUrl: function(url) {
        return this.getRootNode().findChildBy(function(n) {
            return url === n.raw.url;
        }, this, true);
    },

    handleBeforeExpandCollapse: function(node) {
        if(this.getView().isAnimating(node)) {
            return false;
        }
    }

});
