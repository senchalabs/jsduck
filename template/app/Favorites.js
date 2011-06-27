/**
 * Favorites management.
 */
Ext.define("Docs.Favorites", {
    extend: 'Docs.LocalStore',
    storeName: 'Favorites',
    singleton: true,

    init: function() {
        this.callParent(arguments);

        // Populate favorites with Top 10 classes
        if (this.store.data.items.length == 0) {
            var top10 = [
                'Ext.data.Store',
                'Ext',
                'Ext.grid.Panel',
                'Ext.panel.Panel',
                'Ext.form.field.ComboBox',
                'Ext.data.Model',
                'Ext.form.Panel',
                'Ext.button.Button',
                'Ext.tree.Panel',
                'Ext.Component'
            ];
            this.store.add(Ext.Array.map(top10, function(clsName) {
                return {url: "/api/"+clsName, title: clsName};
            }));
            this.syncStore();
        }
        
        // For backwards compatibility with old Favorites Model
        // convert the old-style records to new schema.
        else if (!this.store.first().get("url")) {
            this.store.each(function(r) {
                r.set("title", r.data.cls);
                r.set("url", "/api/"+r.get("cls"));
                r.set("cls", "");
            });
            this.syncStore();
        }
    },

    /**
     * Associates Favorites with Docs TreePanel component.
     * @param {Docs.view.tree.Tree} tree
     */
    setTree: function(tree) {
        this.tree = tree;
    },

    /**
     * Adds page to favorites
     *
     * @param {String} url  the page to add
     * @param {String} title  title for Favorites entry
     */
    add: function(url, title) {
        if (!this.has(url)) {
            this.store.add({url: url, title: title});
            this.syncStore();
            this.tree.setFavorite(url, true);
        }
    },

    /**
     * Removes page from favorites.
     *
     * @param {String} url  the page URL to remove
     */
    remove: function(url) {
        if (this.has(url)) {
            this.store.removeAt(this.store.findExact('url', url));
            this.syncStore();
            this.tree.setFavorite(url, false);
        }
    },

    /**
     * Checks if page exists in favorites
     *
     * @param {String} url  the URL to check
     * @return {Boolean} true when present
     */
    has: function(url) {
        return this.store.findExact('url', url) > -1;
    }
});
