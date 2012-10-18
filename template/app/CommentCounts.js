/**
 * Manages comment counts.
 */
Ext.define('Docs.CommentCounts', {

    /**
     * Initializes CommentCounts with the list of counts from
     * comments_meta request result.
     * @param {Object[]} counts Objects with `_id` and `value` fields.
     */
    constructor: function(counts) {
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
