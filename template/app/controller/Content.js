/**
 * Base class for all controllers that deal with showing content.
 */
Ext.define('Docs.controller.Content', {
    extend: 'Ext.app.Controller',

    // Code for the middle mouse button
    MIDDLE: 1,

    /**
     * @cfg {String} baseUrl (required)
     * The base URL of pages served by this controller.
     */

    /**
     * @cfg {String} title
     * Title to display while index view active.
     */
    title: "",

    loadIndex: function(noHistory) {
        noHistory || Docs.History.push(this.baseUrl);
        this.getViewport().setPageTitle(this.title);
        Ext.getCmp('doctabs').activateTab(this.baseUrl);
        Ext.getCmp('card-panel').layout.setActiveItem(this.getIndex());
        this.getIndex().restoreScrollState();
    },

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
        return document.location.href.replace(/\/?(index.html|template.html|index.php)?#.*/, "");
    }
});
