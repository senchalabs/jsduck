Ext.define('Docs.controller.Comments', {
    extend: 'Ext.app.Controller',

    // baseUrl: 'http://projects.sencha.com/auth',
    baseUrl: 'http://127.0.0.1/sencha/jsduck_out/auth',

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

        this.addEvents('afterMetaLoad');

        this.getController('Classes').on({
            showClass: function(cls, opts) {
                if (opts.reRendered) {
                    if (this.commentMeta) {
                        Docs.view.Comments.renderCommentMeta();
                    } else {
                        this.addListener('afterMetaLoad', function() {
                            Docs.view.Comments.renderCommentMeta();
                        }, this, {
                            single: true
                        });
                    }
                }
            },
            showIndex: function() {
                if (!this.commentMetaTotals) {
                    this.renderMetaToClassIndex = true;
                } else if (!this.renderedMetaToClassIndex) {
                    this.updateClassIndex();
                }
            },
            scope: this
        });

        this.getController('Auth').addListener('loggedIn', function() {
            this.loggedIn = true;
            Docs.view.Comments.renderNewCommentForms();
        }, this);

        this.getController('Auth').addListener('loggedOut', function() {
            this.loggedIn = false;
            Docs.view.Comments.renderNewCommentForms();
        }, this);

        this.control({
            'classoverview': {
                afterrender: function(cmp) {
                    // Map user interactions to methods
                    Ext.Array.each([
                        [ '.expandComments',   'click', this.toggleComments],
                        [ '.newCommentSubmit', 'click', this.postComment],
                        [ '.up',               'click', this.voteUp],
                        [ '.down',             'click', this.voteDown],
                        [ '.member-comments',  'click', this.showMemberComments],
                        [ '.del',              'click', this.promptDeleteComment],
                        [ '.new-comment-a',    'click', this.toggleNewComment],
                        [ '.commentGuide',     'click', this.toggleCommentGuide]
                    ], function(delegate) {
                        cmp.el.addListener(delegate[1], delegate[2], this, {
                            preventDefault: true,
                            delegate: delegate[0]
                        });
                    }, this);
                }
            },

            'classoverview toolbar': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function() {
                        var commentsDiv = Ext.get(Ext.query('#m-comment .comments')[0]);
                        this.getOverview().scrollToEl('#m-comment', -20);
                        this.openComments(commentsDiv);
                    }, this, {
                        delegate: '.comment-btn'
                    });
                }
            },

            'hovermenu': {
                viewready : function(cmp) {
                    if (this.commentMeta) {
                        Docs.view.Comments.renderHoverMenuMeta(cmp.el);
                    } else {
                        this.addListener('afterMetaLoad', function() {
                            Docs.view.Comments.renderHoverMenuMeta(cmp.el);
                        }, this, {
                            single: true
                        });
                    }
                }
            }
        });

        this.fetchCommentMeta();
    },

    fetchCommentMeta: function() {

        Ext.data.JsonP.request({
            url: this.baseUrl + '/comments/_design/Comments/_view/by_target',
            method: 'GET',
            params: {
                reduce: true,
                group_level: 3
            },
            success: function(response) {

                this.commentMeta = {};
                this.commentMetaTotals = {};
                this.commentIdMap = {};

                Ext.Array.each(response.rows, function(r) {
                    this.updateMeta(r.key, r.value.num);
                }, this);

                this.fireEvent('afterMetaLoad');

                if (this.renderMetaToClassIndex) {
                    this.updateClassIndex();
                }
            },
            scope: this
        });
    },

    fetchComments: function(id, callback) {

        var startkey = Ext.JSON.encode(this.commentId(id)),
            endkey = Ext.JSON.encode(this.commentId(id).concat([{}])),
            currentUser = this.getController('Auth').currentUser;

        Ext.data.JsonP.request({
            url: this.baseUrl + '/comments/_design/Comments/_list/with_vote/by_target',
            method: 'GET',
            params: {
                reduce: false,
                startkey: startkey,
                endkey: endkey,
                user: currentUser && currentUser.userName
            },
            success: function(response) {
                callback.call(this, response.rows, id);
            },
            scope: this
        });
    },

    postComment: function(cmp, el) {

        if (!this.getController('Auth').isLoggedIn()) {
            return false;
        }

        var comments = Ext.get(el).up('.comments'),
            id = comments.getAttribute('id'),
            comment = comments.down('textarea').getValue(),
            target = Ext.JSON.encode(this.commentId(id));

        Ext.Ajax.request({
            url: this.addSid(this.baseUrl + '/comments'),
            method: 'POST',
            cors: true,
            params: {
                target: target,
                comment: comment
            },
            callback: function(options, success, response) {
                if (success) {
                    this.updateMeta(this.commentId(id), 1);
                    comments.down('textarea').dom.value = '';
                    this.toggleNewComment(null, el);
                }
                this.fetchComments(id, this.appendNewComment);
            },
            scope: this
        });
    },

    promptDeleteComment: function(cmp, el) {

        if (!this.getController('Auth').isLoggedIn()) {
            return false;
        }

        Ext.Msg.show({
             title:'Are you sure?',
             msg: 'Are you sure you wish to delete this comment?',
             buttons: Ext.Msg.YESNO,
             icon: Ext.Msg.QUESTION,
             fn: function(buttonId) {
                 if (buttonId == 'yes') {
                     this.deleteComment(cmp, el);
                 }
             },
             scope: this
        });
    },

    deleteComment: function(cmp, el) {

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            cls = Ext.get(el).up('.comments').getAttribute('id');

        Ext.Ajax.request({
            url: this.addSid(this.baseUrl + '/comments/' + id + '/delete'),
            cors: true,
            method: 'POST',
            callback: function(options, success, response) {

                console.log(options, success, response)
                var data = Ext.JSON.decode(response.responseText);

                this.updateMeta(this.commentId(cls), -1);
                Ext.get(id).remove();
            },
            scope: this
        });
    },

    voteUp: function(cmp, el) {
        this.vote('up', el);
    },

    voteDown: function(cmp, el) {
        this.vote('down', el);
    },

    vote: function(direction, el) {

        if (!this.getController('Auth').isLoggedIn() || Ext.get(el).hasCls('selected')) {
            this.showError('Please login to vote on this comment', el);
            return false;
        }

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            meta = Ext.get(el).up('.com-meta'),
            scoreEl = meta.down('.score');

        Ext.Ajax.request({
            url: this.addSid(this.baseUrl + '/comments/' + id),
            cors: true,
            method: 'POST',
            params: { vote: direction },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                Ext.Array.each(meta.query('.vote a'), function(voteEl) {
                    Ext.get(voteEl).removeCls('selected');
                });
                if (data.direction === 'up' || data.direction === 'down') {
                    Ext.get(meta.query('.vote a.' + data.direction)[0]).addCls('selected');
                }
                scoreEl.update(String(data.total));
            },
            scope: this
        });
    },

    toggleComments: function(cmp, el) {

        var commentsDiv = Ext.get(el).up('.comments');

        if (commentsDiv.hasCls('open')) {
            this.closeComments(commentsDiv);
        } else {
            this.openComments(commentsDiv);
        }
    },

    openComments: function(commentsDiv) {

        if (commentsDiv.hasCls('open')) return;

        var commentNum =  commentsDiv.down('.name'),
            commentsList =  commentsDiv.down('.comment-list');

        commentsDiv.addCls('open');
        commentNum.setStyle('display', 'none');
        if (commentsList) {
            commentsList.setStyle('display', 'block');
        } else {
            var id = commentsDiv.getAttribute('id');
            this.fetchComments(id, this.renderComments);
        }
    },

    closeComments: function(commentsDiv) {

        if (!commentsDiv.hasCls('open')) return;

        var commentNum =  commentsDiv.down('.name'),
            commentsList =  commentsDiv.down('.comment-list');

        commentsDiv.removeCls('open');
        commentNum.setStyle('display', 'block');
        if (commentsList) {
            commentsList.setStyle('display', 'none');
        }
    },

    showMemberComments: function(cml, el) {
        var member = Ext.get(el).up('.member'),
            commentsDiv = member.down('.comments');

        member.addCls('open');
        this.openComments(commentsDiv);
        this.getOverview().scrollToEl(commentsDiv, -20);
    },

    renderComments: function(rows, id) {
        var comments = Ext.get(id);
        var data = Ext.Array.map(rows, function(r) {
            r.value.id = r.id;
            return r.value;
        });
        Docs.view.Comments.commentsTpl.append(comments, data);

        var commentTpl = (this.loggedIn ? Docs.view.Comments.loggedInCommentTpl : Docs.view.Comments.loggedOutCommentTpl);
        commentTpl.overwrite(comments.down('.new-comment-wrap'), this.loggedIn ? this.getController('Auth').currentUser : {});
    },

    toggleNewComment: function(cmp, el) {
        if (!this.loggedIn) {
            return;
        }

        var newCommentEl = Ext.get(el).up('.new-comment');
        if (newCommentEl.hasCls('open')) {
            newCommentEl.removeCls('open');
        } else {
            newCommentEl.addCls('open');
        }
    },

    appendNewComment: function(rows, id) {
        var newCommentWrap = Ext.get(id).down('.new-comment-wrap'),
            data = rows[rows.length - 1].value;

        data.id = rows[rows.length - 1].id;
        Docs.view.Comments.commentTpl.insertBefore(newCommentWrap, data);
    },

    addSid: function(url) {
        var sid = this.getController('Auth').sid;
        return url + (url.match(/\?/) ? '&' : '?') + 'sid=' + sid;
    },

    updateClassIndex: function(meta) {

        for(var c in this.commentMetaTotals) {
            var cls = Ext.query('#classindex a[rel="' + c + '"]');
            if (cls && cls[0]) {
                Docs.view.Comments.memberCommentsTpl.append(cls[0], [String(this.commentMetaTotals[c])]);
            }
        }

        this.renderedMetaToClassIndex = true;
    },

    updateMeta: function(key, value) {
        var k = (key[2] === '') ? key[1] : key.slice(1,3).join('-'),
            c = key[1],
            divId = 'comments-class-' + k.replace(/\./g, '-');

        this.commentMeta[k] = this.commentMeta[k] || 0;
        this.commentMeta[k] += value;
        this.commentMetaTotals[c] = this.commentMetaTotals[c] || 0;
        this.commentMetaTotals[c] += value;

        this.commentIdMap[divId] = key;
    },

    commentId: function(id) {
        return this.commentIdMap[id] || ['unknown'];
    },

    toggleCommentGuide: function(e, el) {
        var commentForm = Ext.get(el).up('.newCommentForm'),
            guideText = commentForm.down('.commentGuideTxt'),
            curDisplay = guideText.getStyle('display');

        guideText.setStyle('display', (curDisplay == 'none') ? 'block' : 'none');
    },

    showError: function(msg, el) {

        if (this.errorTip) {
            this.errorTip.update(msg);
            this.errorTip.setTarget(el);
            this.errorTip.show();
        } else {
            this.errorTip = Ext.create('Ext.tip.ToolTip', {
                anchor: 'right',
                target: el,
                html: msg
            });
            this.errorTip.show();
        }

    }
});