/**
 * Retrieving and posting Comments
 */
Ext.define('Docs.controller.Comments', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/comments',
    title: 'Comments',

    mixins: {
        authMixin: 'Docs.controller.AuthHelpers'
    },

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#commentindex'
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

    loadIndex: function() {
        this.fireEvent('loadIndex');
        Ext.getCmp('treecontainer').hide();
        if (!this.recentComments) {
            this.fetchRecentComments('recentcomments');
            this.recentComments = true;
        }
        this.callParent([true]);
    },

    fetchComments: function(id, callback, opts) {

        var startkey = Ext.JSON.encode(this.commentId(id)),
            endkey = Ext.JSON.encode(this.commentId(id).concat([{}])),
            currentUser = this.getController('Auth').currentUser,
            url = Docs.baseUrl + '/' + Docs.commentsDb + '/_design/Comments/_list/with_vote/by_target';

        Ext.data.JsonP.request({
            url: url,
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
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb),
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

    /**
     * Fetches the most recent comments
     */
    fetchRecentComments: function(id) {

        var url = Docs.baseUrl + '/' + Docs.commentsDb + '/_design/Comments/_list/with_vote/by_date';

        Ext.data.JsonP.request({
            url: url,
            method: 'GET',
            params: {
                descending: true,
                limit: 10
            },
            success: function(response) {
                this.renderComments(response.rows, id, {showCls: true, hideCommentForm: true});
            },
            scope: this
        });
    },

    /**
     * Promts the user for confirmation of comment deletion. Deleted the comment
     * if the user confirms.
     */
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

    /**
     * Sends a delete comment request to the server.
     */
    deleteComment: function(cmp, dom) {

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            cls = Ext.get(el).up('.comments').getAttribute('id');

        Ext.Ajax.request({
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb + '/' + id + '/delete'),
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
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb + '/' + id),
            cors: true,
            method: 'POST',
            params: { vote: direction },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                Ext.Array.each(meta.query('.vote a'), function(voteEl) {
                    Ext.get(voteEl).removeCls('selected');
                });
                if (data.direction === 'up' || data.direction === 'down') {
                    Ext.get(meta.query('.vote a.voteComment' + (data.direction == 'up' ? 'Up' : 'Down'))[0]).addCls('selected');
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

    renderComments: function(rows, id, opts) {

        opts = opts || {};

        var comments = Ext.get(id);
        var data = Ext.Array.map(rows, function(r) {
            r.value.id = r.id;
            r.value = Ext.merge(r.value, opts);
            return r.value;
        });
        Docs.view.Comments.commentsTpl.append(comments, data);

        if (opts.hideCommentForm) {
            comments.addCls('hideCommentForm');
        } else if (!comments.hasCls('hideCommentForm')) {
            var commentTpl = (this.loggedIn() ? Docs.view.Comments.loggedInCommentTpl : Docs.view.Comments.loggedOutCommentTpl);
            commentTpl.overwrite(comments.down('.new-comment-wrap'), this.loggedIn() ? this.getController('Auth').currentUser : {});
        }
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