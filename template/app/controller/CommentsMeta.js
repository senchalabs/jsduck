/**
 * Handles Comment meta data - the number of comments on a class and its members.
 * Also deals with keeping meta content up to date when comments are added or removed.
 */
Ext.define('Docs.controller.CommentsMeta', {
    extend: 'Ext.app.Controller',

    mixins: {
        authMixin: 'Docs.controller.AuthHelpers'
    },

    refs: [
        {
            ref: 'toolbar',
            selector: 'classoverview toolbar'
        },
        {
            ref: 'authentication',
            selector: 'authentication'
        },
        {
            ref: 'overview',
            selector: 'classoverview'
        }
    ],

    init: function() {
        Docs.commentMeta = {
            idMap: {},
            'class': {},
            guide: {},
            video: {}
        };
        Docs.commentSubscriptions = {};

        this.addEvents(
            /**
             * @event afterLoad  Fired after a meta data is loaded
             */
            'afterLoad'
        );

        if (!Docs.enableComments) {
            return;
        }

        this.getController('Auth').on({
            available: function() {
                this.fetchCommentMeta();
            },
            loggedIn: function() {
                this.fetchSubscriptionMeta();
            },
            scope: this
        });

        this.getController('Comments').on({
            add: function(id) {
                this.updateCommentMeta(id, 1);
            },
            remove: function(id) {
                this.updateCommentMeta(id, -1);
            },
            scope: this
        });

        this.getController('Classes').on({
            showIndex: function() {
                this.updateClassIndex();
            },
            showClass: function(cls, opts) {
                if (opts.reRendered) {
                    this.createCommentIdMap(this.getController('Classes').currentCls);
                    this.renderClassCommentMeta(cls);
                }
            },
            scope: this
        });

        this.getController('Guides').on({
            showGuide: function(guide, opts) {
                Docs.commentMeta.idMap['comments-guide-' + guide] = ['guide', guide, ''];
                this.renderGuideCommentMeta(guide);
            },
            scope: this
        });

        this.getController('Videos').on({
            showVideo: function(video, opts) {
                Docs.commentMeta.idMap['comments-video-' + video] = ['video', video, ''];
                this.renderVideoCommentMeta(video);
            },
            scope: this
        });

        this.control({
            'hovermenu': {
                refresh : this.refreshHoverMenu
            }
        });
    },

    /**
     * Fetch all comment meta data and populate a local store
     */
    fetchCommentMeta: function() {
        this.request("jsonp", {
            url: '/comments_meta',
            method: 'GET',
            success: function(response) {
                Ext.Array.each(response.comments, function(r) {
                    this.updateMeta(r._id.split('__'), r.value);
                }, this);

                Ext.Array.each(response.subscriptions, function(r) {
                    var commentId = 'comments-' + r.join('-').replace(/\./g, '-').replace(/-$/, '');
                    Docs.commentSubscriptions[commentId] = true;
                }, this);

                this.metaLoaded = true;
                this.fireEvent('afterLoad');
                this.updateClassIndex();
            },
            scope: this
        });
    },

    /**
     * Fetch all comment meta data and populate a local store
     */
    fetchSubscriptionMeta: function() {
        this.request("jsonp", {
            url: '/subscriptions',
            method: 'GET',
            success: function(response) {
                Ext.Array.each(response.subscriptions, function(r) {
                    var commentId = 'comments-' + r.join('-').replace(/\./g, '-').replace(/-$/, '');
                    Docs.commentSubscriptions[commentId] = true;
                }, this);
            },
            scope: this
        });
    },

    /**
     * Called when a comment is added or removed. Updates the meta table, then refreshes the view
     */
    updateCommentMeta: function(id, delta) {
        var clsId = Docs.commentMeta.idMap[id];
        this.updateMeta(clsId, delta);
        if (clsId[0] == 'guide') {
            Docs.view.Comments.updateGuideCommentMeta(clsId[1]);
        } else if (clsId[0] == 'video') {
            Docs.view.Comments.updateVideoCommentMeta(clsId[1]);
        } else {
            Docs.view.Comments.updateClassCommentMeta(clsId[1]);
        }
    },

    /**
     * Update comment count info
     * @param key Path to class / property
     * @param delta Difference to comment number
     */
    updateMeta: function(key, delta) {
        Docs.commentMeta[key[0]] = Docs.commentMeta[key[0]] || {};
        Docs.commentMeta[key[0]][key[1]] = Docs.commentMeta[key[0]][key[1]] || { total: 0 };
        Docs.commentMeta[key[0]][key[1]][key[2]] = Docs.commentMeta[key[0]][key[1]][key[2]] || 0;

        Docs.commentMeta[key[0]][key[1]][key[2]] += delta;
        Docs.commentMeta[key[0]][key[1]]['total'] += delta;
    },

    /**
     * Creates a mapping between comment element IDs and DB view keys.
     */
    createCommentIdMap: function(cls) {
        Docs.commentMeta.idMap[('comments-class-' + cls.name).replace(/\./g, '-')] = ['class', cls.name, ''];

        cls.members && this.createMembersCommentIdMap(cls, cls.members);
        cls.statics && this.createMembersCommentIdMap(cls, cls.statics);
    },

    createMembersCommentIdMap: function(cls, members) {
        for (var type in members) {
            Ext.Array.each(members[type], function(m) {
                var origKey = ['class', cls.name, m.id];
                var key = ['class', m.owner, m.id];
                var commentId = 'comments-' + origKey.join('-').replace(/\./g, '-');
                Docs.commentMeta.idMap[commentId] = key;
            }, this);
        }
    },

    refreshHoverMenu: function(cmp) {
        this.afterMetaLoaded(function() {
            Docs.view.Comments.renderHoverMenuMeta(cmp.el);
        }, this);
    },

    updateClassIndex: function() {
        if (this.getController('Comments').commentsEnabled) {
            this.afterMetaLoaded(function() {
                Docs.view.Comments.updateClassIndex();
            }, this);
        }
    },

    renderClassCommentMeta: function(cls) {
        this.afterMetaLoaded(function() {
            Docs.view.Comments.updateClassCommentMeta(cls);
        }, this);
    },

    renderGuideCommentMeta: function(cls) {
        this.afterMetaLoaded(function() {
            Docs.view.Comments.updateGuideCommentMeta(cls);
        }, this);
    },

    renderVideoCommentMeta: function(cls) {
        this.afterMetaLoaded(function() {
            Docs.view.Comments.updateVideoCommentMeta(cls);
        }, this);
    },

    // Ensures that comments metadata has been loaded, then executes
    // the callback.
    afterMetaLoaded: function(callback, scope) {
        if (this.metaLoaded) {
            callback.call(scope);
        } else {
            this.addListener('afterLoad', callback, scope, {
                single: true
            });
        }
    }
});
