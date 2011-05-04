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
        var url = document.location.href;
        return url.replace(/\/api:.*/, "").replace(/\/$/, "");
    }
});
