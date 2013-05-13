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
     * Invokes #search after a specified delay.
     *
     * @param {String} term  The query string to search for
     * @param {Function} callback Function to call with an array of search results.
     * @param {Object} scope Scope for the function.
     * @param {Number} delay Milliseconds to wait before starting.
     */
    deferredSearch: function(term, callback, scope, delay) {
        // When new search term comes in, cancel the previous delayed search.
        clearTimeout(this.timeout);

        var timeout = this.timeout = Ext.Function.defer(function() {
            this.search(term, function(results) {
                // When new search is already started, don't show the
                // results of old search.
                if (timeout === this.timeout) {
                    callback.call(scope, results);
                }
            }, this);
        }, delay, this);
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
                fragsize: 32,
                max_fragments: 1,
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
            fullName: this.format(guide.body),
            url: guide.url,
            meta: {},
            score: guide.score
        };
    },

    // Gets rid of newlines (search results view doesn't like them)
    // Collapses continuos whitespace into one space.
    // Replaces supplied highlighting with our highlighting tags.
    format: function(data) {
        var s = data.replace(/\s+/g, " ");
        return s.replace(/<em class="match">(.*?)<\/em>/g, "<strong>$1</strong>");
    }
});
