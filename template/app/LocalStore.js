/**
 * Provides methods dealing with localStorage- and memory-store.
 *
 * Base class for Favorites and Settings.
 */
Ext.define("Docs.LocalStore", {
    storeName: '',

    /**
     * Initializes store management.
     *
     * Initializes this.store variable and loads the store if
     * localStorage available.
     */
    init: function() {
        this.localStorage = ('localStorage' in window && window['localStorage'] !== null);
        this.store = Ext.getStore(this.storeName);

        if (this.localStorage) {
            this.store.load();
            if (window.addEventListener) {
                window.addEventListener("storage", Ext.Function.bind(this.onStorageChange, this), false);
            }
            else {
                window.attachEvent("onstorage", Ext.Function.bind(this.onStorageChange, this));
            }
        }
    },

    // When records in localstorage change, reload the store.
    onStorageChange: function(e) {
        e = e || window.event;
        if (e.key === this.store.getProxy().id) {
            this.store.load();
        }
    },

    /**
     * Syncs the store with localStorage if possible.
     */
    syncStore: function() {
        this.localStorage && this.store.sync();
    }

});
