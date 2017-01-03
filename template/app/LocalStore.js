/**
 * Provides methods dealing with localStorage- and memory-store.
 *
 * Base class for Settings.
 */
Ext.define("Docs.LocalStore", {
    /**
     * @cfg
     * Full name of the store class to instantiate.
     */
    storeName: '',

    /**
     * Initializes store management.
     *
     * Initializes this.store variable and loads the store if
     * localStorage available.
     */
    init: function() {
        this.localStorage = !!window['localStorage'];
        this.store = Ext.create(this.storeName);

        if (this.localStorage) {
            this.cleanup();
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
    },

    // Removes all extra stuff from localstorage that isn't needed any
    // more. Like old favorites and mistakenly created '{local_storage_db}...' keys.
    cleanup: function() {
        var re = /-settings/;
        // remove all entries from localstorage where key doesn't match the regex
        for (var i=0; i<window.localStorage.length; i++) {
            var key = window.localStorage.key(i);
            if (!re.test(key)) {
                window.localStorage.removeItem(key);
            }
        }
    }
});
