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
        var url = this.parseToken(token);
        if (url.url == "#!/api") {
            Docs.App.getController('Classes').loadIndex(true);
        }
        else if (url.type === "api") {
            Docs.App.getController('Classes').loadClass(url.url, true);
        }
        else if (url.url === "#!/guide") {
            Docs.App.getController('Guides').loadIndex(true);
        }
        else if (url.type === "guide") {
            Docs.App.getController('Guides').loadGuide(url.url, true);
        }
        else if (url.url === "#!/video") {
            Docs.App.getController('Videos').loadIndex(true);
        }
        else if (url.type === "video") {
            Docs.App.getController('Videos').loadVideo(url.url, true);
        }
        else if (url.url === "#!/example") {
            Docs.App.getController('Examples').loadIndex();
        }
        else if (url.type === "example") {
            Docs.App.getController('Examples').loadExample(url.url, true);
        }
        else {
            Docs.App.getController('Welcome').loadIndex(true);
        }
    },

    // Parses current browser location
    parseToken: function(token) {
        var matches = token && token.match(/!?(\/(api|guide|example|video)(\/(.*))?)/);
        return matches ? {type: matches[2], url: "#!"+matches[1]} : {};
    },

    /**
     * Adds URL to history
     *
     * @param {String} token  the part of URL after #
     */
    push: function(token) {
        token = this.cleanUrl(token);
        if (!/^#!?/.test(token)) {
            token = "#!"+token;
        }
        Ext.util.History.add(token);
    },

    /**
     * Given a URL, removes anything before a #
     */
    cleanUrl: function(url) {
        return url.replace(/^[^#]+#/, '#');
    }
});
