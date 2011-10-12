/**
 * Retrieving and posting Comments
 */
Ext.define('Docs.controller.Comments', {
    extend: 'Ext.app.Controller',

    // baseUrl: 'http://projects.sencha.com/auth',
    baseUrl: 'http://127.0.0.1/sencha/jsduck_out/auth',

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

        this.addEvents(
            /**
             * @event add  Fired after a comment is added
             * @param {String} key  Key of the comment
             */
            'add',

            /**
             * @event remove  Fired after a comment is removed
             * @param {String} key  Key of the comment
             */
            'remove'
        );

        this.getController('Auth').on({
            loggedIn:  function() {
                Docs.view.Comments.renderNewCommentForms();
            },
            loggedOut: function() {
                Docs.view.Comments.renderNewCommentForms()
            }
        });

        this.getController('Classes').on({
            showClass: function(cls, opts) {
                if (opts.reRendered) {
                    Docs.view.Comments.renderClassCommentContainers(this.currentCls);
                }
            }
        });

        this.control({
            'classoverview': {
                afterrender: function(cmp) {
                    // Map user interactions to methods
                    Ext.Array.each([
                        [ '.toggleComments',       'click', this.toggleComments],
                        [ '.toggleMemberComments', 'click', this.showMemberComments],
                        [ '.toggleNewComment',     'click', this.toggleNewComment],
                        [ '.toggleCommentGuide',   'click', this.toggleCommentGuide],
                        [ '.postComment',          'click', this.postComment],
                        [ '.deleteComment',        'click', this.promptDeleteComment],
                        [ '.voteCommentUp',        'click', this.voteUp],
                        [ '.voteCommentDown',      'click', this.voteDown]
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
            }
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

        if (!this.loggedIn()) {
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
                    this.fireEvent('add', id);
                    comments.down('textarea').dom.value = '';
                    this.toggleNewComment(null, el);
                }
                this.fetchComments(id, this.appendNewComment);
            },
            scope: this
        });
    },

    promptDeleteComment: function(cmp, el) {

        if (!this.loggedIn()) {
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
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    this.fireEvent('remove', cls);
                    Ext.get(id).remove();
                }
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

    /**
     * @private
     */
    vote: function(direction, el) {

        if (!this.loggedIn()) {
            this.showError('Please login to vote on this comment', el);
            return false;
        }
        else if (Ext.get(el).hasCls('selected')) {
            this.showError('You have already voted on this comment', el);
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

        var commentTpl = (this.loggedIn() ? Docs.view.Comments.loggedInCommentTpl : Docs.view.Comments.loggedOutCommentTpl);
        commentTpl.overwrite(comments.down('.new-comment-wrap'), this.loggedIn() ? this.getController('Auth').currentUser : {});
    },

    toggleNewComment: function(cmp, el) {
        if (!this.loggedIn()) {
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

    commentId: function(id) {
        return Docs.commentMeta.idMap[id] || ['unknown'];
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