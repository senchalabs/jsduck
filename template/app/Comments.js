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
     * Loads the comments of a particular target.
     * @param {String[]} target An array of `[type, cls, member]`
     * @param {Function} callback Called when finished.
     * @param {Object[]} callback.comments An array of comments.
     * @param {Object} scope
     */
    load: function(target, callback, scope) {
        this.request("jsonp", {
            url: '/comments',
            method: 'GET',
            params: {
                startkey: Ext.JSON.encode(target)
            },
            success: callback,
            scope: scope
        });
    },

    /**
     * Votes the comment up or down.
     * @param {Object} cfg
     * @param {Docs.model.Comment} cfg.comment
     * @param {Docs.model.Comment} cfg.direction
     * @param {Function} cfg.success Called with resulting direction and total score.
     * @param {Function} cfg.failure
     * @param {Object} cfg.scope
     */
    vote: function(cfg) {
        this.request("ajax", {
            url: '/comments/' + cfg.comment.get("id"),
            method: 'POST',
            params: { vote: cfg.direction },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    cfg.success && cfg.success.call(cfg.scope, data.direction, data.total);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
    },

    /**
     * Loads the plain Markdown content of comment.
     * @param {Object} cfg
     * @param {Docs.model.Comment} cfg.comment
     * @param {Function} cfg.success Called with the original Markdown content
     * @param {Function} cfg.failure
     * @param {Object} cfg.scope
     */
    loadContent: function(cfg) {
        this.request("ajax", {
            url: '/comments/' + cfg.comment.get("id"),
            method: 'GET',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    cfg.success && cfg.success.call(cfg.scope, data.content);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
    },

    /**
     * Saves the plain Markdown content of comment.
     * @param {Object} cfg
     * @param {Docs.model.Comment} cfg.comment
     * @param {String} cfg.newContent The new content.
     * @param {Function} cfg.success Called with the resulting HTML content
     * @param {Function} cfg.failure
     * @param {Object} cfg.scope
     */
    saveContent: function(cfg) {
        this.request("ajax", {
            url: '/comments/' + cfg.comment.get("id"),
            method: 'POST',
            params: {
                content: cfg.newContent
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    cfg.success && cfg.success.call(cfg.scope, data.content);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
    },

    /**
     * Marks the comment as deleted or undoes the delete.
     * @param {Object} cfg
     * @param {Docs.model.Comment} cfg.comment
     * @param {Boolean} cfg.deleted True to delete, false to undo.
     * @param {Function} cfg.success
     * @param {Function} cfg.failure
     * @param {Object} cfg.scope
     */
    setDeleted: function(cfg) {
        Docs.Comments.request("ajax", {
            url: '/comments/' + cfg.comment.get("id") + (cfg.deleted ? '/delete' : '/undo_delete'),
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    cfg.success && cfg.success.call(cfg.scope);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
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
    },

    /**
     * Generates an `<img>` tag for loading the avatar.
     * @param {String} emailHash MD5 hash of users e-mail address.
     * @return {String}
     */
    avatar: function(emailHash) {
        return '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/' +
               emailHash + '?s=25&amp;r=PG&amp;d=monsterid">';
    }

});
