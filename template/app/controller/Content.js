/**
 * Base class for Classes controller.
 */
Ext.define('Docs.controller.Content', {
    extend: 'Ext.app.Controller',

    // Code for the middle mouse button
    MIDDLE: 1,

    // True when middle mouse button pressed or shift/ctrl key pressed
    // together with mouse button (for Mac)
    opensNewWindow: function(event) {
        return event.button === this.MIDDLE || event.shiftKey || event.ctrlKey;
    },

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    }

});
