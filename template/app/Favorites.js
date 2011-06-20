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
            this.store.add([
                { cls: 'Ext.data.Store' },
                { cls: 'Ext' },
                { cls: 'Ext.grid.Panel' },
                { cls: 'Ext.panel.Panel' },
                { cls: 'Ext.form.field.ComboBox' },
                { cls: 'Ext.data.Model' },
                { cls: 'Ext.form.Panel' },
                { cls: 'Ext.button.Button' },
                { cls: 'Ext.tree.Panel' },
                { cls: 'Ext.Component' }
            ]);
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
     * Adds class to favorites
     *
     * @param {String} cls  the class to add
     */
    add: function(cls) {
        if (!this.has(cls)) {
            this.store.add({cls: cls});
            this.syncStore();
            this.tree.setFavorite(cls, true);
        }
    },

    /**
     * Removes class from favorites.
     *
     * @param {String} cls  the class to remove
     */
    remove: function(cls) {
        if (this.has(cls)) {
            this.store.removeAt(this.store.findExact('cls', cls));
            this.syncStore();
            this.tree.setFavorite(cls, false);
        }
    },

    /**
     * Checks if class is in favorites
     *
     * @param {String} cls  the classname to check
     * @return {Boolean} true when class exists in favorites.
     */
    has: function(cls) {
        return this.store.findExact('cls', cls) > -1;
    }
});
