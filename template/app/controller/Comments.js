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
            ref: 'overview',
            selector: 'classoverview'
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
            'viewport': {
                afterrender: function(cmp) {
                    // Map user interactions to methods
                    Ext.Array.each([
                        [ '.toggleComments',       'click', this.toggleComments],
                        [ '.toggleMemberComments', 'click', this.showMemberComments],
                        [ '.toggleNewComment',     'click', this.toggleNewComment],
                        [ '.toggleCommentGuide',   'click', this.toggleCommentGuide],
                        // [ '.toggleCodeEditor',     'click', this.toggleCodeEditor],
                        [ '.postComment',          'click', this.postComment],
                        [ '.updateComment',        'click', this.updateComment],
                        [ '.deleteComment',        'click', this.promptDeleteComment],
                        [ '.editComment',          'click', this.editComment],
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
                callback.call(this, response.rows, id, opts);
            },
            scope: this
        });
    },

    postComment: function(cmp, el) {

        if (!this.loggedIn()) {
            return false;
        }

        var postButton = Ext.get(el),
            comments = postButton.up('.comments'),
            id = comments.getAttribute('id'),
            target = Ext.JSON.encode(this.commentId(id)),
            textarea = comments.down('textarea').dom;

        var comment = textarea.editor.getValue();

        if (postButton.hasCls('disabled')) {
            return false;
        }
        postButton.addCls('disabled');

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
                    var data = Ext.JSON.decode(response.responseText);
                    this.fireEvent('add', id);
                    textarea.editor.setValue('');
                    postButton.removeCls('disabled');
                    this.toggleNewComment(null, el);
                    this.fetchComments(id, this.appendNewComment, {id: data.id});
                }
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
                limit: 100
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
    deleteComment: function(cmp, el) {

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            commentsEl = Ext.get(el).up('.comments'),
            cls = commentsEl && commentsEl.getAttribute('id');

        Ext.Ajax.request({
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb + '/' + id + '/delete'),
            cors: true,
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    if (cls) {
                        this.fireEvent('remove', cls);
                    }
                    Ext.get(id).remove();
                }
            },
            scope: this
        });
    },

    editComment: function(cmp, el) {
        var commentEl = Ext.get(el).up('.comment'),
            commentId = commentEl.getAttribute('id'),
            contentEl = commentEl.down('.content'),
            currentUser = this.getController('Auth').currentUser;

        Ext.Ajax.request({
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb + '/' + commentId),
            method: 'GET',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    var editForm = Docs.view.Comments.editCommentTpl.overwrite(contentEl, Ext.merge(currentUser, {
                        content: data.content,
                        update: true
                    }), true);

                    var textarea = editForm.down('textarea').dom;
                    this.makeCodeMirror(textarea);
                }
            },
            scope: this
        });
    },

    updateComment: function(cmp, el) {

        if (!this.loggedIn()) {
            return false;
        }

        var postButton = Ext.get(el),
            comment = postButton.up('.comment'),
            id = comment.getAttribute('id');

        var content = comment.down('textarea').dom.editor.getValue();

        if (postButton.hasCls('disabled')) {
            return false;
        }
        postButton.addCls('disabled');

        Ext.Ajax.request({
            url: this.addSid(Docs.baseUrl + '/' + Docs.commentsDb + '/' + id),
            method: 'POST',
            cors: true,
            params: {
                content: content
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    comment.down('.content').update(data.content);
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

                if (data.success) {
                    Ext.Array.each(meta.query('.vote a'), function(voteEl) {
                        Ext.get(voteEl).removeCls('selected');
                    });
                    if (data.direction === 'up' || data.direction === 'down') {
                        Ext.get(meta.query('.vote a.voteComment' + (data.direction == 'up' ? 'Up' : 'Down'))[0]).addCls('selected');
                    }
                    scoreEl.update(String(data.total));
                } else {
                    this.showError(data.reason, el);
                    return false;
                }
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

            var commentWrap = comments.down('.new-comment-wrap');

            if (this.loggedIn()) {
                var wrap = Docs.view.Comments.loggedInCommentTpl.overwrite(commentWrap, this.getController('Auth').currentUser, true),
                    textarea = wrap.down('textarea').dom;

                this.makeCodeMirror(textarea);
            } else {
                Docs.view.Comments.loggedOutCommentTpl.overwrite(commentWrap, {});
            }
        }
    },

    makeCodeMirror: function(textarea) {
        textarea.editor = CodeMirror.fromTextArea(textarea, {
            enterMode: "keep",
            mode: 'markdown',
            indentUnit: 4
        });
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

    appendNewComment: function(rows, domId, opts) {
        var newCommentWrap = Ext.get(domId).down('.new-comment-wrap'),
            data;

        if (opts.id) {
            Ext.Array.each(rows, function(row) {
                if (row.id == opts.id) {
                    data = row.value;
                    data.id = opts.id;
                }
            })
        } else {
            data = rows[rows.length - 1].value;
            data.id = rows[rows.length - 1].id;
        }

        Docs.view.Comments.commentTpl.insertBefore(newCommentWrap, data);
    },

    commentId: function(id) {
        return Docs.commentMeta.idMap[id] || ['unknown'];
    },

    toggleCommentGuide: function(e, el) {
        var commentForm = Ext.get(el).up('form'),
            guideText = commentForm.down('.commentGuideTxt'),
            curDisplay = guideText.getStyle('display');

        guideText.setStyle('display', (curDisplay == 'none') ? 'block' : 'none');
    },

    // toggleCodeEditor: function(e, el) {
    //
    //     var but = Ext.get(el),
    //         textarea = but.up('form').down('textarea').dom;
    //
    //     if (but.hasCls('selected')) {
    //         this.closeCodeEditor(but);
    //     } else {
    //         but.addCls('selected');
    //         but.editor = CodeMirror.fromTextArea(textarea, {
    //             enterMode: "keep",
    //             mode: { name: 'markdown' },
    //             indentUnit: 4
    //         });
    //     }
    // },

    closeCodeEditor: function(but) {
        but.removeCls('selected');
        if (but.editor) {
            but.editor.toTextArea();
        }
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