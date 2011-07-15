/**
 * The class tree
 */
Ext.define('Docs.view.tree.Tree', {
    extend: 'Ext.tree.Panel',
    alias : 'widget.classtree',
    requires: [
        'Docs.Favorites'
    ],

    cls: 'class-tree iScroll',
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

        this.nodeTpl = new Ext.XTemplate(
            '<a href="#{url}" rel="{url}" class="docClass">{text}</a> ',
            '<a rel="{url}" class="fav {show}"></a>'
        );

        // Expand the main tree
        this.root.expanded = true;
        this.root.children[0].expanded = true;

        this.on("itemclick", this.onItemClick, this);

        this.callParent();

        // Add links for favoriting classes.
        // Do this after callParent, because the getRootNode() will
        // work after initComponent has run.
        Docs.Favorites.setTree(this);
        this.initFavIcons();
    },

    initFavIcons: function() {
        this.getRootNode().cascadeBy(this.addFavIcons, this);
    },

    addFavIcons: function(node) {
        if (node.get("leaf")) {
            var url = node.raw.url;
            node.set("text", this.nodeTpl.apply({
                text: node.get("text"),
                url: url,
                show: Docs.Favorites.has(url) ? "show" : ""
            }));
            node.commit();
        }
    },

    onItemClick: function(view, node, item, index, e) {
        var url = node.raw ? node.raw.url : node.data.url;

        if (url) {
            if (e.getTarget(".fav")) {
                var favEl = Ext.get(e.getTarget(".fav"));
                if (favEl.hasCls('show')) {
                    Docs.Favorites.remove(url);
                }
                else {
                    Docs.Favorites.add(url, this.getNodeTitle(node));
                }
            }
            // Only fire the event when not clicking on a link.
            // Clicking on link is handled by the browser itself.
            else if (!e.getTarget("a")) {
                this.fireEvent("urlclick", url, e);
            }
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

    /**
     * Sets favorite status of link on or off.
     *
     * @param {String} url  URL of the link
     * @param {Boolean} enable  true to mark class as favorite.
     */
    setFavorite: function(url, enable) {
        var r = this.findRecordByUrl(url);
        if (r) {
            var show = enable ? "show" : "";
            r.set("text", r.get("text").replace(/class="fav *(show)?"/, 'class="fav '+show+'"'));
            r.commit();
        }
    },

    findRecordByUrl: function(url) {
        return this.getRootNode().findChildBy(function(n) {
            return url === n.raw.url;
        }, this, true);
    },

    getNodeTitle: function(node) {
        var m = node.raw.url.match(/^\/api\/(.*)$/);
        if (m) {
            return m[1];
        }
        else {
            return node.raw.text;
        }
    }

});
