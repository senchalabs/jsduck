/**
 * Favorites management.
 */
Ext.define("Docs.Favorites", {
    extend: 'Docs.LocalStore',
    storeName: 'Favorites',
    singleton: true,
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function() {
        this.callParent(arguments);

        this.addEvents(
            /**
             * Fired when favorite added.
             * @param {String} url The URL of the favorited page
             */
            "add",
            /**
             * Fired when favorite removed.
             * @param {String} url The URL of the favorited page
             */
            "remove"
        );
    },

    init: function() {
        this.callParent(arguments);

        // For backwards compatibility with old Favorites Model
        // convert the old-style records to new schema.
        if (this.store.first() && !this.store.first().get("url")) {
            this.store.each(function(r) {
                r.set("title", r.data.cls);
                r.set("url", "/api/"+r.get("cls"));
                r.set("cls", "");
            });
            this.syncStore();
        }
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
            this.fireEvent("add", url);
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
            this.fireEvent("remove", url);
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
    },

    /**
     * Returns the number of favorites.
     * @return {Number}
     */
    getCount: function() {
        return this.store.getCount();
    },

    /**
     * Save order of favorites in store.
     *
     * This needs to be called explicitly, because of a bug in
     * localStorage which prevents the order of items being saved when
     * they're changed.
     */
    saveOrder: function() {
        this.store.getProxy().setIds(Ext.Array.map(this.store.data.items, function(i) { return i.data.id; }));
    }
});
