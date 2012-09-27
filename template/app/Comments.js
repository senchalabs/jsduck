/**
 * Provides a way to perform queries to the comments backend.
 */
Ext.define('Docs.Comments', {
    singleton: true,
    requires: [
        "Docs.Auth",
        "Docs.CommentCounts",
        "Ext.data.JsonP",
        "Ext.Ajax"
    ],

    /**
     * Initializes the whole comments system.
     *
     * - Establishes session with comments server.
     * - Loads comments counts data.
     *
     * @param {Function} callback Called after done.
     * @param {Object} scope
     */
    init: function(callback, scope) {
        if (!Docs.enableComments) {
            callback.call(scope);
            return;
        }

        Docs.Auth.init(function(success) {
            if (success) {
                this.enabled = true;
                this.counts = new Docs.CommentCounts(this);
                this.counts.fetch(callback, scope);
            }
            else {
                callback.call(scope);
            }
        }, this);
    },

    /**
     * True when comments system is enabled.
     * @return {Boolean}
     */
    isEnabled: function() {
        return this.enabled;
    },

    /**
     * @inheritdoc Docs.CommentCounts#get
     */
    getCount: function(type, cls, member) {
        return this.counts.get(type, cls, member);
    },

    /**
     * @inheritdoc Docs.CommentCounts#getClassTotal
     */
    getClassTotalCount: function(className) {
        return this.counts.getClassTotal(className);
    },

    /**
     * Performs request to the comments server.
     *
     * Works as if calling Ext.Ajax.request or Ext.data.JsonP.request
     * directly, but prefixes the URL with docs base URL and database
     * name and adds Session ID.
     *
     * @param {String} proxy Should we perform "ajax" or "jsonp" request.
     * @param {Object} config
     */
    request: function(type, config) {
        config.url = this.buildUrl(config.url);
        if (type === "jsonp") {
            Ext.data.JsonP.request(config);
        }
        else {
            // Allow doing Cross Origin request.
            config.cors = true;
            Ext.Ajax.request(config);
        }
    },

    buildUrl: function(url) {
        url = Docs.baseUrl + '/' + Docs.commentsDb + '/' + Docs.commentsVersion + url;
        return url + (url.match(/\?/) ? '&' : '?') + 'sid=' + Docs.Auth.getSid();
    }

});
