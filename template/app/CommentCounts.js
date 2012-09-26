/**
 *
 */
Ext.define('Docs.CommentCounts', {
    singleton: true,
    requires: ["Docs.Comments"],

    constructor: function() {
        this.loadCallbacks = [];
    },

    /**
     * Fetches all comment counts.
     */
    fetch: function() {
        Docs.Comments.request("jsonp", {
            url: '/comments_meta',
            method: 'GET',
            success: function(response) {
                this.load(response.comments);
                this.fireLoadCallbacks();
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
    },

    /**
     * Calls the given function after comment counts have been loaded.
     * @param {Function} callback
     * @param {Object} scope
     */
    afterLoaded: function(callback, scope) {
        if (this.counts) {
            callback.call(scope);
        }
        else {
            this.loadCallbacks.push(Ext.Function.bind(callback, scope));
        }
    },

    fireLoadCallbacks: function() {
        Ext.Array.forEach(this.loadCallbacks, function(cb) {
            cb();
        });
        this.loadCallbacks = [];
    }

});
