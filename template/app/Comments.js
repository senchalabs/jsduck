/**
 * Provides a way to perform queries to the comments backend.
 */
Ext.define('Docs.Comments', {
    singleton: true,
    requires: [
        "Docs.Auth",
        "Docs.CommentCounts",
        "Docs.CommentSubscriptions",
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
                this.fetchCountsAndSubscriptions(function(counts, subscriptions) {
                    this.counts = new Docs.CommentCounts(counts);
                    this.subscriptions = new Docs.CommentSubscriptions(subscriptions);
                    callback.call(scope);
                }, this);
            }
            else {
                callback.call(scope);
            }
        }, this);
    },

    // Fetches comment counts and subscriptions.
    fetchCountsAndSubscriptions: function(callback, scope) {
        this.request("jsonp", {
            url: '/comments_meta',
            method: 'GET',
            success: function(response) {
                callback.call(scope, response.comments, response.subscriptions);
            },
            scope: this
        });
    },

    /**
     * Loads subscription data for current user.
     * Called after logging in.
     * @param {Function} callback Called after done.
     * @param {Object} scope
     */
    loadSubscriptions: function(callback, scope) {
        this.fetchSubscriptions(function(subscriptions) {
            this.subscriptions = new Docs.CommentSubscriptions(subscriptions);
            callback.call(scope);
        }, this);
    },

    /**
     * Clears the data about all subcsriptions.
     * Called after logging out.
     */
    clearSubscriptions: function() {
        this.subscriptions = new Docs.CommentSubscriptions([]);
    },

    fetchSubscriptions: function(callback, scope) {
        this.request("jsonp", {
            url: '/subscriptions',
            method: 'GET',
            success: function(response) {
                callback.call(scope, response.subscriptions);
            },
            scope: this
        });
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
     * @inheritdoc Docs.CommentSubscriptions#has
     */
    hasSubscription: function(target) {
        return this.subscriptions.has(target);
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
     * Posts a new comments to a particular target.
     * @param {String[]} target An array of `[type, cls, member]`
     * @param {String} content The new content
     * @param {Function} callback Called when finished.
     * @param {Object} callback.comment The newly posted comment.
     * @param {Object} scope
     */
    post: function(target, content, callback, scope) {
        this.request("ajax", {
            url: '/comments',
            method: 'POST',
            params: {
                target: Ext.JSON.encode(target),
                comment: content,
                url: this.buildPostUrl(target)
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    callback && callback.call(scope, data.comment);
                }
            },
            scope: this
        });
    },

    buildPostUrl: function(target) {
        var type = target[0];
        var cls = target[1];
        var member = target[2];

        if (type == 'video') {
            var hash = '#!/video/' + cls;
        }
        else if (type == 'guide') {
            var hash = '#!/guide/' + cls;
        }
        else {
            var hash = '#!/api/' + cls + (member ? '-' + member : '');
        }

        return "http://" + window.location.host + window.location.pathname + hash;
    },

    /**
     * Subscribes (or unsubscribes) the current user to particular target.
     * @param {String[]} target An array of `[type, cls, member]`
     * @param {Boolean} subscribed True to subscribe, false to unsubscribe.
     * @param {Function} callback Called when finished.
     * @param {Object} scope
     */
    subscribe: function(target, subscribed, callback, scope) {
        this.request("ajax", {
            url: '/subscribe',
            method: 'POST',
            params: {
                target: Ext.JSON.encode(target),
                subscribed: subscribed
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success) {
                    this.subscriptions.set(target, subscribed);
                    callback && callback.call(scope);
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
        config.url = this.buildRequestUrl(config.url);
        if (type === "jsonp") {
            Ext.data.JsonP.request(config);
        }
        else {
            // Allow doing Cross Origin request.
            config.cors = true;
            Ext.Ajax.request(config);
        }
    },

    buildRequestUrl: function(url) {
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
    },

    /**
     * Returns HTML for rendering the span with comments count.
     * Defined here so we can uniformly use the same HTML everywhere.
     * @param {Number} count
     * @return {String}
     */
    counterHtml: function(count) {
        return count > 0 ? '<span class="comment-counter-small">'+count+'</span>' : '';
    }

});
