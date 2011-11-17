/**
 * Handles Comment meta data - the number of comments on a class and its members.
 * Also deals with keeping meta content up to date when comments are added or removed.
 */
Ext.define('Docs.controller.CommentsMeta', {
    extend: 'Ext.app.Controller',

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
        Ext.data.JsonP.request({
            url: Docs.baseUrl + '/' + Docs.commentsDb + '/_design/Comments/_view/by_target',
            method: 'GET',
            params: {
                reduce: true,
                group_level: 3
            },
            success: function(response) {
                Ext.Array.each(response.rows, function(r) {
                    this.updateMeta(r.key, r.value.num);
                }, this);

                this.metaLoaded = true;
                this.fireEvent('afterLoad');
                this.updateClassIndex();
            },
            scope: this
        });
    },

    fetchCommentLeaders: function() {
        Ext.data.JsonP.request({
            url: Docs.baseUrl + '/' + Docs.commentsDb + '/_design/Comments/_view/by_author',
            method: 'GET',
            params: {
                reduce: true,
                group_level: 1,
                descending: true,
                limit: 10
            },
            success: function(response) {
                var tpl = Ext.create('Ext.XTemplate',
                    '<h1>Comment reputation</h1>',
                    '<table>',
                    '<tpl for=".">',
                        '<tr><td>{value}</td><td>{key}</td></tr>',
                    '</tpl>',
                    '</table>'
                );

                tpl.append(Ext.get(Ext.query('#welcomeindex .news .l')[0]), response.rows);
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

        if (cls.members) {
            for (var member in cls.members) {
                Ext.Array.each(cls.members[member], function(memberItem) {
                    var origKey = ['class', cls.name, memberItem.id];
                    var key = ['class', memberItem.owner, memberItem.id];
                    var commentId = 'comments-' + origKey.join('-').replace(/\./g, '-');
                    Docs.commentMeta.idMap[commentId] = key;
                }, this);
            }
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
