/**
 * Manages the front page and switching between the main parts of docs
 * app.
 */
Ext.define("Docs.App", {
    singleton: true,

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    },

    /**
     * Initializes listeners for all kind of links on front page.
     */
    init: function() {
        // load front page when clicked on logo
        Ext.get(Ext.query(".header > h2 > a")[0]).addListener('click', function() {
            this.setIndexMode();
        }, this, {preventDefault: true});

        // load guide when clicked on guide link
        Ext.Array.forEach(Ext.query("#api-overview .guides a"), function(el) {
            Ext.get(el).addListener('click', function() {
                this.setGuideMode();
                Docs.Guides.load(el.href);
            }, this, {preventDefault: true});
        }, this);
    },

    setIndexMode: function() {
        Ext.get("top-block").setStyle({display: 'block'});
        Ext.get("top-block").update('<h1>Ext JS 4.0 API Documentation</h1>');

        Ext.get("api-overview").setStyle({display: 'block'});
        Ext.get("api-guide").setStyle({display: 'none'}).update("");
        Ext.get("api-class").setStyle({display: 'none'});
    },

    setGuideMode: function() {
        Ext.get("top-block").setStyle({display: 'none'});

        Ext.get("api-overview").setStyle({display: 'none'});
        Ext.get("api-guide").setStyle({display: 'block'});
        Ext.get("api-class").setStyle({display: 'none'});
    },

    setClassMode: function() {
        Ext.get("top-block").setStyle({display: 'block'});

        Ext.get("api-overview").setStyle({display: 'none'});
        Ext.get("api-guide").setStyle({display: 'none'}).update("");
        Ext.get("api-class").setStyle({display: 'block'});
    }
});
