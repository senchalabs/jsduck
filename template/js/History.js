/**
 * Browser history management with history.pushState for compliant
 * browsers.
 */
Ext.define("Docs.History", {
    singleton: true,
    compliant: window.history && window.history.pushState,

    /**
     * Initializes history management.
     */
    init: function() {
        if (!this.compliant) {
            return;
        }

        window.addEventListener('popstate', Ext.bind(function(e) {
            e.preventDefault();
            this.navigate();
            return false;
        }, this), false);

        this.navigate();
    },

    // Parses current URL and navigates to the page
    navigate: function() {
        var url = this.parseUrl();
        if (url.type === "api") {
            Docs.ClassLoader.load(url.key, true);
            Ext.getCmp('treePanelCmp').selectClass(url.key);
        }
        else if (url.type === "guide") {
            Docs.App.setGuideMode();
            Docs.Guides.load(url.key, true);
        }
    },

    // Parses current browser location
    parseUrl: function() {
        var matches = document.location.hash.match(/#\/(api|guide)\/(.*)/);
        return matches ? {type: matches[1], key: matches[2]} : {};
    },

    /**
     * Adds URL to history
     *
     * @param {String} url  the part of URL after #
     */
    push: function(url) {
        if (!this.compliant) {
            return;
        }
        var fullUrl = Docs.App.getBaseUrl() + "#" + url;
        window.history.pushState({}, '', fullUrl);
    }
});
