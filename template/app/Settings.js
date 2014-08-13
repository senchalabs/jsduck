/**
 * Provides access to Docs app settings.
 */
Ext.define("Docs.Settings", {
    extend: 'Docs.LocalStore',
    singleton: true,
    requires: 'Docs.store.Settings',
    storeName: 'Docs.store.Settings',

    // Default values for settings for which undefined doesn't suite.
    defaults: {
        show: {
            "public": true,
            "protected": false,
            "private": false,
            "deprecated": false,
            "removed": false,
            "inherited": true,
            "accessor": true,
            "android": true,
            "blackberry": true,
            "iphone": true,
            "ipad": true,
            "mobileweb": true,
            "tizen": true
        },
        comments: {
            hideRead: false
        },
        showPrivateClasses: false,
        classTreeLogic: "PackageLogic"
    },

    /**
     * Saves a setting
     *
     * @param {String} key  Name of the setting
     * @param {Object} value  Value of the setting
     */
    set: function(key, value) {
        var index = this.store.findExact("key", key);
        // There is currently a bug in localstorage with Ext that
        // prevents updated records getting synced properly. As a
        // temporary fix, remove and re-add the item instead of just
        // changing the value.
        if (index > -1) {
            this.store.removeAt(index);
        }
        this.store.add({key: key, value: value});

        this.syncStore();
    },

    /**
     * Gets value of a setting.
     *
     * @param {String} key  Name of the setting
     * @return {Object} value of the setting or undefined.
     */
    get: function(key) {
        var index = this.store.findExact("key", key);
        return index > -1 ? this.store.getAt(index).get("value") : this.defaults[key];
    }
});
