/**
 * Performs the full-text search of guides contents.
 */
Ext.define("Docs.GuideSearch", {
    singleton: true,

    /**
     * True when guides search is enabled
     * (jsduck was run with --search-url option).
     * @return {Boolean}
     */
    isEnabled: function() {
        return !!Docs.data.guideSearch.url;
    },

    /**
     * Peforms the search remotely, then calls the given function.
     *
     * @param {String} term  The query string to search for
     * @param {Function} callback Function to call with an array of search results.
     * @param {Object} scope Scope for the function.
     */
    search: function(term, callback, scope) {
        var request = this.currentRequest = Ext.data.JsonP.request({
            url: Docs.data.guideSearch.url,
            params: {
                q: term,
                product: Docs.data.guideSearch.product,
                version: Docs.data.guideSearch.version,
                start: 0,
                limit: 100 // get all guides, there aren't so many.
            },
            callback: function(success, data) {
                // only continue when the finished request is the last
                // one that was started.
                if (success && data.success && this.currentRequest === request) {
                    callback.call(scope, Ext.Array.map(data.docs, this.adaptJson, this));
                }
            },
            scope: this
        });
    },

    adaptJson: function(guide) {
        return {
            icon: "icon-guide",
            name: this.format(guide.title),
            fullName: this.shortenContext(this.format(guide.body)),
            url: this.shortenUrl(guide.url),
            meta: {},
            score: guide.score
        };
    },

    // Extracts string from Array if needed
    // Escapes HTML (not escaped in JSON)
    // Gets rid of newlines (search results view doesn't like them)
    // Replaces supplied highlighting with our highlighting tags.
    format: function(data) {
        var s = Ext.isArray(data) ? data[0] : data;
        var s = Ext.String.htmlEncode(s).replace(/\n/g, " ");
        return s.replace(/&lt;em class=&quot;match&quot;&gt;(.*?)&lt;\/em&gt;/g, "<strong>$1</strong>");
    },

    // Removes search context before the matching text.
    shortenContext: function(s) {
        return s.replace(/^[^<]*/, '');
    },

    shortenUrl: function(url) {
        return url.replace(/^.*#!/, "#!");
    }
});
