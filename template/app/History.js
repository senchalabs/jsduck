/**
 * Browser history management using Ext.util.History.
 */
Ext.define("Docs.History", {
    singleton: true,

    /**
     * Initializes history management.
     */
    init: function() {
        Ext.util.History.init(function() {
            this.navigate(Ext.util.History.getToken());
        }, this);
        Ext.util.History.on("change", this.navigate, this);
    },

    // Parses current URL and navigates to the page
    navigate: function(token) {
        if (this.ignoreChange) {
            this.ignoreChange = false;
            return;
        }
        
        var url = this.parseToken(token);
        if (url.type === "api") {
            Docs.App.getController('Classes').loadClass(url.key, true);
        }
        else if (url.type === "guide") {
            Docs.App.getController('Classes').showGuide(url.key, true);
        }
        else {
            Ext.getCmp('container').layout.setActiveItem(0);
        }
    },

    // Parses current browser location
    parseToken: function(token) {
        var matches = token && token.match(/\/(api|guide)\/(.*)/);
        return matches ? {type: matches[1], key: matches[2]} : {};
    },

    /**
     * Adds URL to history
     *
     * @param {String} token  the part of URL after #
     */
    push: function(token) {
        this.ignoreChange = true;
        Ext.util.History.add(token);
    }
});
