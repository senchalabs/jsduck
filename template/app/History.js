/**
 * Browser history management using Ext.util.History.
 */
Ext.define("Docs.History", {
    singleton: true,

    /**
     * Initializes history management.
     */
    init: function() {
        // allow Docs to work inside iframe
        Ext.util.History.useTopWindow = false;

        Ext.util.History.init(function() {
            this.historyLoaded = true;
            this.initialNavigate();
        }, this);

        Ext.util.History.on("change", function(url) {
            this.navigate(url, true);
        }, this);
    },

    /**
     * Called from Tabs controller to notify that initial tabs loading had been done.
     */
    notifyTabsLoaded: function() {
        this.tabsLoaded = true;
        this.initialNavigate();
    },

    // Invoke initial navigation only after both tabs and history are loaded
    initialNavigate: function() {
        if (this.tabsLoaded && this.historyLoaded) {
            this.navigate(Ext.util.History.getToken(), true);
        }
    },

    /**
     * Parses given URL and navigates to the page.
     *
     * @param {String} token An URL where to navigate.
     * @param {Boolean} [noHistory=false] True to skip adding new history entry.
     */
    navigate: function(token, noHistory) {
        var url = this.parseToken(token);
        if (url.url == "#!/api") {
            Docs.App.getController('Classes').loadIndex(noHistory);
        }
        else if (url.type === "api") {
            Docs.App.getController('Classes').loadClass(url.url, noHistory);
        }
        else if (url.url === "#!/guide") {
            Docs.App.getController('Guides').loadIndex(noHistory);
        }
        else if (url.type === "guide") {
            Docs.App.getController('Guides').loadGuide(url.url, noHistory);
        }
        else if (url.url === "#!/video") {
            Docs.App.getController('Videos').loadIndex(noHistory);
        }
        else if (url.type === "video") {
            Docs.App.getController('Videos').loadVideo(url.url, noHistory);
        }
        else if (url.url === "#!/example") {
            Docs.App.getController('Examples').loadIndex();
        }
        else if (url.type === "example") {
            Docs.App.getController('Examples').loadExample(url.url, noHistory);
        }
        else if (url.url === "#!/comment") {
            Docs.App.getController('Comments').loadIndex();
        }
        else if (url.url === "#!/tests") {
            Docs.App.getController('Tests').loadIndex();
        }
        else {
            if (Docs.App.getController('Welcome').isActive()) {
                Docs.App.getController('Welcome').loadIndex(noHistory);
            }
            else if (!this.noRepeatNav) {
                this.noRepeatNav = true; // Prevent infinite nav loop
                var firstTab = Ext.getCmp('doctabs').staticTabs[0];
                if (firstTab) {
                    this.navigate(firstTab.href, noHistory);
                }
            }
        }
    },

    // Parses current browser location
    parseToken: function(token) {
        var matches = token && token.match(/!?(\/(api|guide|example|video|comment|tests)(\/(.*))?)/);
        return matches ? {type: matches[2], url: "#!"+matches[1]} : {};
    },

    /**
     * Adds URL to history
     *
     * @param {String} token  the part of URL after #
     */
    push: function(token, opts) {
        token = this.cleanUrl(token);
        if (!/^#!?/.test(token)) {
            token = "#!"+token;
        }
        // Firefox sometimes has %21 instead of !.
        // This happens with URL-s inside normal links on page.
        //
        // So at first round history entry beginning with %21 is added
        // which triggers navigate() to load the right page, but this
        // comes around in circle to here and pushes a new entry
        // beginning with "!" and so a double-entry would be added
        // because the new entry differs from previous although they
        // are really the same.
        //
        // To prevent this, check that previous equivalent entry isn't
        // equivalent to new one.
        var prevToken = Ext.util.History.getToken() || "";
        if ("#"+prevToken.replace(/^%21/, "!") !== token) {
            Ext.util.History.add(token);
        }
    },

    /**
     * Given a URL, removes anything before #
     */
    cleanUrl: function(url) {
        return url.replace(/^[^#]*#/, '#');
    }
});
