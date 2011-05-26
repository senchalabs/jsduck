/**
 * Favorites management.
 */
Ext.define("Docs.Favorites", {
    extend: 'Docs.LocalStore',
    storeName: 'Favorites',
    singleton: true,

    /**
     * Adds class to favorites
     *
     * @param {String} cls  the class to add
     */
    add: function(cls) {
        if (!this.has(cls)) {
            this.store.add({cls: cls});
            this.syncStore();
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
