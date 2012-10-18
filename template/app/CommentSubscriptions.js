/**
 * Manages comment subscriptions.
 */
Ext.define('Docs.CommentSubscriptions', {

    /**
     * Initializes CommentSubscriptions with the list of subscriptions from
     * comments_meta request result.
     *
     * @param {String[][]} subscriptions 2D array like:
     *
     *     [
     *         ['class', 'Ext', 'method-foo'],
     *         ['class', 'Ext', 'method-bar']
     *     ]
     */
    constructor: function(subscriptions) {
        this.subscriptions = {};
        Ext.Array.each(subscriptions, function(r) {
            this.subscriptions[r.join("__")] = true;
        }, this);
    },

    /**
     * True if current user has subscribed to a particular target.
     * @param {String[]} target
     * @return {Boolean}
     */
    has: function(target) {
        return this.subscriptions[target.join("__")];
    },

    /**
     * Sets the subscribed/unsubscribed status of a target.
     * @param {String[]} target
     * @param {Boolean} subscribed
     */
    set: function(target, subscribed) {
        this.subscriptions[target.join("__")] = subscribed;
    }

});
