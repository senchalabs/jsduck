/**
 * Favorites management.
 */
Ext.define("Docs.Favorites", {
    singleton: true,

    /**
     * Initializes favorites management.
     */
    init: function() {
        // Load Favorites from localStorage
        this.store = Ext.getStore("Favorites");
        this.store.load();
    },

    /**
     * Adds class to favorites
     *
     * @param {String} cls  the class to add
     */
    add: function(cls) {
        if (!this.has(cls)) {
            this.store.add({cls: cls});
            this.store.sync();
        }
    },

    /**
     * Removes class from favorites.
     *
     * @param {String} cls  the class to remove
     */
    remove: function(cls) {
        if (this.has(cls)) {
            this.store.removeAt(this.store.find('cls', cls));
            this.store.sync();
        }
    },

    /**
     * Checks if class is in favorites
     *
     * @param {String} cls  the classname to check
     * @return {Boolean} true when class exists in favorites.
     */
    has: function(cls) {
        return this.store.find('cls', cls) > -1;
    }

});
