/**
 * Global functions that I don't know where else to put.
 */
Ext.define("Docs.App", {
    singleton: true,
    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "");
    }
});
