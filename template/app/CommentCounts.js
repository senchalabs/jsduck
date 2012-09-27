/**
 * Manages comment counts.
 */
Ext.define('Docs.CommentCounts', {

    /**
     * Initialized CommentCounts with the main Comments class instance
     * which is used to perform queries.
     * @param {Docs.Comments} comments
     */
    constructor: function(comments) {
        this.comments = comments;
        this.loadCallbacks = [];
    },

    /**
     * Fetches all comment counts.
     *
     * @param {Function} callback Called after done.
     * @param {Object} scope
     */
    fetch: function(callback, scope) {
        this.comments.request("jsonp", {
            url: '/comments_meta',
            method: 'GET',
            success: function(response) {
                this.load(response.comments);
                callback.call(scope);
            },
            scope: this
        });
    },

    load: function(counts) {
        this.counts = {};
        Ext.Array.each(counts, function(r) {
            this.counts[r._id] = r.value;
        }, this);
    },

    /**
     * Returns comments count for a specific item.
     * @param {String} type
     * @param {String} cls
     * @param {String} member
     * @return {Number}
     */
    get: function(type, cls, member) {
        var key = [type||"", cls||"", member||""].join("__");
        return this.counts[key];
    },

    /**
     * Returns the total number of comments on a class itself +
     * comments on all its members.
     * @param {String} className
     * @return {Number}
     */
    getClassTotal: function(className) {
        if (!this.totals) {
            this.totals = {};
            Ext.Object.each(this.counts, function(key, count) {
                var parts = key.split("__");
                if (parts[0] === "class") {
                    this.totals[parts[1]] = (this.totals[parts[1]] || 0) + count;
                }
            }, this);
        }
        return this.totals[className];
    }

});
