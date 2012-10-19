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
     * Returns comments count for a specific target.
     * @param {String[]} target
     * @return {Number}
     */
    get: function(target) {
        return this.counts[target.join("__")] || 0;
    },

    /**
     * Changes comment count of a target by the given amount.
     * @param {String[]} target The target which count to change.
     * @param {Number} amount Usually +1 or -1.
     * @return {Number} The resulting total amount of comments.
     */
    change: function(target, amount) {
        // reset the totals cache
        delete this.totals;

        return this.counts[target.join("__")] = this.get(target) + amount;
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
