/**
 * Retrieving and posting Comments
 */
Ext.define('Docs.controller.Comments', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/comment',
    title: 'Comments',

    mixins: {
        authMixin: 'Docs.controller.AuthHelpers'
    },

    requires: [
        "Docs.view.auth.LoginHelper",
        "Docs.view.comments.Form",
        "Docs.Settings",
        "Docs.Syntax",
        "Docs.Tip"
    ],

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
        },
        {
            ref: 'commentsList',
            selector: 'commentsList'
        }
    ],

    // Recent comments query parameters that aren't saved into cookies.
    recentCommentsSettings: {},

    init: function() {
        this.addEvents(
            /**
             * @event add
             * Fired after a comment is added
             * @param {String} key  Key of the comment
             */
            'add',

            /**
             * @event remove
             * Fired after a comment is removed
             * @param {String} key  Key of the comment
             */
            'remove',

            /**
             * @event changeSubscription
             * Fired after a comment email subscription has changed
             * @param {Boolean} subscribed  Whether the subscription is active
             * @param {String} key  Key of the comment
             */
            'changeSubscription'
        );

        if (!Docs.enableComments) {
            return;
        }

        this.getController('Auth').on({
            available: function() {
                this.enableComments();
            },
            loggedIn:  function() {
                Docs.view.Comments.renderNewCommentForms();
                this.getController("Tabs").showCommentsTab();
            },
            loggedOut: function() {
                Docs.view.Comments.renderNewCommentForms();
                this.getController("Tabs").hideCommentsTab();
            },
            scope: this
        });

        this.getController('Classes').on({
            showClass: function(cls, opts) {
                if (opts.reRendered) {
                    this.renderClassCommentContainers(cls);
                }
            },
            scope: this
        });

        this.getController('Guides').on({
            showGuide: function(guide, opts) {
                if (opts.reRendered) {
                    this.renderGuideCommentContainers(guide);
                }
            },
            scope: this
        });

        this.getController('Videos').on({
            showVideo: function(video, opts) {
                if (opts.reRendered) {
                    this.renderVideoCommentContainers(video);
                }
            },
            scope: this
        });

        this.control({
            'viewport': {
                afterrender: function(cmp) {
                    // Map comment interactions to methods
                    Ext.Array.each([
                        [ '.toggleComments',       'click', this.toggleComments],
                        [ '.toggleMemberComments', 'click', this.showMemberComments],
                        [ '.toggleNewComment',     'click', this.toggleNewComment],
                        [ '.toggleCommentGuide',   'click', this.toggleCommentGuide],
                        [ '.postComment',          'click', this.postComment],
                        [ '.updateComment',        'click', this.updateComment],
                        [ '.cancelUpdateComment',  'click', this.cancelUpdateComment],
                        [ '.deleteComment',        'click', this.deleteComment],
                        [ '.undoDeleteComment',    'click', this.undoDeleteComment],
                        [ '.editComment',          'click', this.editComment],
                        [ '.readComment',          'click', this.readComment],
                        [ '.fetchMoreComments',    'click', this.fetchMoreComments],
                        [ '.voteCommentUp',        'click', this.voteUp],
                        [ '.voteCommentDown',      'click', this.voteDown]
                    ], function(delegate) {
                        cmp.el.addListener(delegate[1], delegate[2], this, {
                            preventDefault: true,
                            delegate: delegate[0]
                        });
                    }, this);

                    cmp.el.addListener('click', this.updateSubscription, this, {
                        delegate: '.subscriptionCheckbox'
                    });
                }
            },

            'commentsList': {
                hideReadChange: function() {
                    this.fetchRecentComments();
                },
                sortOrderChange: function(orderBy) {
                    this.recentCommentsSettings.sortByScore = (orderBy === "votes");
                    this.fetchRecentComments();
                }
            },

            'commentsUsers': {
                select: function(username) {
                    this.recentCommentsSettings.username = username;
                    this.fetchRecentComments();
                }
            },

            'commentsTargets': {
                select: function(target) {
                    this.recentCommentsSettings.targetId = target && target.get("id");
                    this.fetchRecentComments();
                }
            },

            'classoverview toolbar': {
                commentcountclick: function(cmp) {
                    var commentsDiv = Ext.get(Ext.query('.comments-section .comments-div')[0]);
                    this.getOverview().scrollToEl('.comments-section', -20);
                    this.openComments(commentsDiv);
                }
            }
        });
    },

    isMod: function() {
        return this.getController('Auth').isModerator();
    },

    enableComments: function() {
        if (!this.commentsEnabled) {
            this.commentsEnabled = true;
        }
    },

    loadIndex: function() {
        this.fireEvent('loadIndex');
        Ext.getCmp('treecontainer').hide();
        if (!this.recentComments) {
            this.fetchRecentComments();
            this.recentComments = true;
        }
        this.callParent([true]);
    },

    fetchComments: function(id, callback, opts) {
        var startkey = Ext.JSON.encode(this.commentId(id)),
            endkey = Ext.JSON.encode(this.commentId(id).concat([{}])),
            currentUser = this.getController('Auth').currentUser;

        this.request("jsonp", {
            url: '/comments',
            method: 'GET',
            params: {
                reduce: false,
                startkey: startkey,
                endkey: endkey,
                user: currentUser && currentUser.userName
            },
            success: function(response) {
                callback.call(this, response, id, opts);
            },
            scope: this
        });
    },

    postComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
            return false;
        }

        var postButton = Ext.get(el),
            comments = postButton.up('.comments-div'),
            id = comments.getAttribute('id'),
            target = this.commentId(id),
            encodedTarget = Ext.JSON.encode(target),
            textarea = comments.down('textarea').dom,
            comment = textarea.editor.getValue(),
            feedbacks = comments.select('[name=feedback]');

        var feedbackRating = null;
        if (feedbacks) {
            feedbacks.each(function(feedback) {
                if (feedback.dom.checked) {
                    feedbackRating = feedback.dom.value;
                }
            });
        }

        if (comment.replace(/( |\n|\t)+/g, '') == '') {
            return false;
        }

        if (this.lastCommentPost && ((Math.ceil(Number(new Date()) / 1000)) - this.lastCommentPost) < 10) {
            Ext.Msg.alert('Please wait', 'Please wait 10 seconds between posting comments.');
            return false;
        }

        if (postButton.hasCls('disabled')) {
            return false;
        }
        postButton.addCls('disabled');

        var url = target[1],
            title = target[1],
            urlPrefix = '#!/api/';

        if (target[0] == 'video') {
            title = 'Video ' + title;
            urlPrefix = '#!/video/';
        } else if (target[0] == 'guide') {
            title = 'Guide ' + title;
            urlPrefix = '#!/guide/';
        } else if (target[2] != '') {
            url += '-' + target[2];
            title += ' ' + target[2];
        }

        this.request("ajax", {
            url: '/comments',
            method: 'POST',
            params: {
                target: encodedTarget,
                comment: comment,
                rating: feedbackRating,
                title: title,
                url: "http://" + window.location.host + window.location.pathname + urlPrefix + url
            },
            callback: function(options, success, response) {
                if (response && response.responseText) {
                    var data = Ext.JSON.decode(response.responseText);
                    this.fireEvent('add', id);
                    textarea.editor.setValue('');
                    postButton.removeCls('disabled');
                    this.toggleNewComment(null, el);
                    this.lastCommentPost = Math.ceil(Number(new Date()) / 1000);
                    if (data.success && data.id) {
                        this.fetchComments(id, this.appendNewComment, {id: data.id});
                    } else {
                        Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
                    }
                }
            },
            scope: this
        });
    },

    /**
     * Fetches the most recent comments
     */
    fetchRecentComments: function(offset) {
        var settings = Docs.Settings.get('comments');
        var params = {
            offset: offset || 0,
            limit: 100,
            hideRead: settings.hideRead ? 1 : undefined,
            sortByScore: this.recentCommentsSettings.sortByScore ? 1 : undefined,
            username: this.recentCommentsSettings.username,
            targetId: this.recentCommentsSettings.targetId
        };

        this.getCommentsList().setMasked(true);

        this.request("jsonp", {
            url: '/comments_recent',
            method: 'GET',
            params: params,
            success: function(response) {
                this.getCommentsList().setMasked(false);

                this.renderComments(response, 'recentcomments', {
                    hideCommentForm: true,
                    append: !!offset,
                    showCls: true
                });
            },
            scope: this
        });
    },

    isChecked: function(id) {
        var cb = Ext.get(id);
        return cb && cb.dom.checked;
    },

    fetchMoreComments: function(cmp, el) {
        this.fetchRecentComments(Ext.get(el).getAttribute('rel'));
    },

    /**
     * Sends a delete comment request to the server.
     */
    deleteComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
            return;
        }

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            commentsEl = Ext.get(el).up('.comments-div'),
            target = commentsEl && commentsEl.getAttribute('id');

        this.request("ajax", {
            url: '/comments/' + id + '/delete',
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    if (target) {
                        this.fireEvent('remove', target);
                    }
                    // Ext.get(id).remove();
                    Ext.get(id).update('<div class="deleted-comment">Comment was deleted. <a href="#" class="undoDeleteComment">Undo</a>.</div>');
                } else {
                    Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
                }
            },
            scope: this
        });
    },

    /**
     * Sends a read comment request to the server.
     */
    readComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
            return;
        }

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            commentsEl = Ext.get(el).up('.comments-div'),
            target = commentsEl && commentsEl.getAttribute('id');

        this.request("ajax", {
            url: '/comments/' + id + '/read',
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    Ext.get(el).addCls('read');
                } else {
                    Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
                }
            },
            scope: this
        });
    },

    /**
     * Sends an undo request to the server.
     */
    undoDeleteComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
            return;
        }

        var commentEl = Ext.get(el).up('.comment');
        var id = commentEl.getAttribute('id');
        var commentsEl = commentEl.up('.comments-div');
        var target = commentsEl && commentsEl.getAttribute('id');

        this.request("ajax", {
            url: '/comments/' + id + '/undo_delete',
            method: 'POST',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    if (target) {
                        this.fireEvent('add', target);
                    }
                    data.comment.id = data.comment._id;
                    var com = Docs.view.Comments.commentTpl.insertBefore(commentEl, data.comment);
                    Docs.Syntax.highlight(com);
                    commentEl.remove();
                } else {
                    Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
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

        this.request("ajax", {
            url: '/comments/' + commentId,
            method: 'GET',
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    contentEl.dom.origContent = contentEl.dom.innerHTML;

                    new Docs.view.comments.Form({
                        renderTo: contentEl,
                        user: currentUser,
                        content: data.content
                    });
                }
            },
            scope: this
        });
    },

    updateComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
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

        this.request("ajax", {
            url: '/comments/' + id,
            method: 'POST',
            params: {
                content: content
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    var contentEl = comment.down('.content');
                    contentEl.update(data.content);
                    Docs.Syntax.highlight(contentEl);
                }
            },
            scope: this
        });
    },

    cancelUpdateComment: function(cmp, el) {
        var cancelButton = Ext.get(el),
            comment = cancelButton.up('.comment'),
            content = comment.down('.content');

        if (content && content.dom.origContent) {
            content.update(content.dom.origContent);
        }
    },

    voteUp: function(cmp, el) {
        this.vote('up', el);
    },

    voteDown: function(cmp, el) {
        this.vote('down', el);
    },

    updateSubscription: function(cmp, el) {
        var commentEl = Ext.get(el).up('.comments-div'),
            labelEl = Ext.get(el).up('label'),
            commentId = commentEl.getAttribute('id'),
            subscribed = el.checked;

        this.request("ajax", {
            url: '/subscribe',
            method: 'POST',
            params: {
                target: Ext.JSON.encode(this.commentId(commentId)),
                subscribed: subscribed
            },
            success: function() {
                if (subscribed) {
                    Docs.Tip.show("Updates to this thread will be e-mailed to you.", labelEl, "bottom");
                }
                else {
                    Docs.Tip.show("You have unsubscribed from this thread.", labelEl, "bottom");
                }
            },
            failure: function() {
                Docs.Tip.show("Subscription change failed.", labelEl, "bottom");
                el.checked = !el.checked;
            },
            scope: this
        });
    },

    /**
     * @private
     */
    vote: function(direction, el) {
        if (!this.isLoggedIn()) {
            Docs.Tip.show('Please login to vote on this comment', el);
            return false;
        }
        else if (Ext.get(el).hasCls('selected')) {
            Docs.Tip.show('You have already voted on this comment', el);
            return false;
        }

        var id = Ext.get(el).up('.comment').getAttribute('id'),
            meta = Ext.get(el).up('.com-meta'),
            scoreEl = meta.down('.score');

        this.request("ajax", {
            url: '/comments/' + id,
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
                    Docs.Tip.show(data.reason, el);
                    return false;
                }
            },
            scope: this
        });
    },

    toggleComments: function(cmp, el) {
        var commentsDiv = Ext.get(el).up('.comments-div');

        if (commentsDiv.hasCls('open')) {
            this.closeComments(commentsDiv);
        } else {
            this.openComments(commentsDiv);
        }
    },

    openComments: function(commentsDiv) {
        if (commentsDiv.hasCls('open')) return;

        var commentNum = commentsDiv.down('.name'),
            commentsList = commentsDiv.down('.comment-list');

        commentsDiv.addCls('open');
        commentNum.setStyle('display', 'none');

        if (commentsList) {
            commentsList.setStyle('display', 'block');
        } else {
            var id = commentsDiv.getAttribute('id');
            Docs.view.Comments.loadingTpl.append(commentsDiv);
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
        var member = Ext.get(el).up('.member');
        // Ensure we're inside a member.
        // We could also be on classes index page
        // in which case we do nothing.
        if (member) {
            var commentsDiv = member.down('.comments-div');
            member.addCls('open');
            this.openComments(commentsDiv);
            this.getOverview().scrollToEl(commentsDiv, -20);
        }
    },

    renderClassCommentContainers: function() {
        var cls = this.getController('Classes').currentCls;
        Docs.view.Comments.renderClassCommentContainers(cls);
    },

    renderGuideCommentContainers: function(guide) {
        Docs.view.Comments.classCommentsTpl.append(Ext.get('guide').down(".x-panel-body"), {
            num: 0,
            id: 'guide-' + guide
        });
    },

    renderVideoCommentContainers: function(video) {
        Docs.view.Comments.classCommentsTpl.append(Ext.get('video').down(".x-panel-body"), {
            num: 0,
            id: 'video-' + video
        });
    },

    renderComments: function(rows, id, opts) {
        opts = opts || {};

        var comments = Ext.get(id),
            loadingEl = comments.down('.loading');

        var data = Ext.Array.map(rows, function(r) {
            r.id = r._id;
            r.key = r.target;
            if (opts.showCls) {
                r.showCls = true;
            }
            return r;
        });

        if (loadingEl) {
            loadingEl.remove();
        }

        if (opts.append) {
            // append comments as new div so we can highlight it separately
            var div = document.createElement("div");
            Docs.view.Comments.appendCommentsTpl.append(div, data);
            comments.down('.comment-list').appendChild(div);
            Docs.Syntax.highlight(div);

            this.updateCommentsPager(comments, data);
        } else {
            var list = comments.down('.comment-list');
            if (list) {
                Docs.view.Comments.appendCommentsTpl.overwrite(list, data);

                this.updateCommentsPager(comments, data);
            }
            else {
                Docs.view.Comments.commentsTpl.append(comments, data);
            }
            Docs.Syntax.highlight(comments);
        }

        if (opts.hideCommentForm) {
            comments.addCls('hideCommentForm');
        } else if (!comments.hasCls('hideCommentForm')) {
            var commentWrap = comments.down('.new-comment-wrap');
            if (this.isLoggedIn()) {

                new Docs.view.comments.Form({
                    renderTo: commentWrap,
                    user: this.getController('Auth').currentUser,
                    userSubscribed: Docs.commentSubscriptions[id]
                });
            } else {
                Docs.view.auth.LoginHelper.renderToComments(commentWrap);
            }
        }
    },

    updateCommentsPager: function(comments, data) {
        var last = data[data.length - 1] || {};
        var pager = comments.down('.recent-comments-pager');
        if (pager) {
            pager.update(Docs.view.Comments.getPagerHtml(last));
        }
    },

    toggleNewComment: function(cmp, el) {
        if (!this.isLoggedIn()) {
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
                if (row._id == opts.id) {
                    data = row;
                    data.id = opts.id;
                }
            });
        } else {
            data = rows[rows.length - 1];
            data.id = rows[rows.length - 1]._id;
        }

        Docs.view.Comments.commentTpl.insertBefore(newCommentWrap, data);
        Docs.Syntax.highlight(newCommentWrap.up(".comment-list"));
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

    closeCodeEditor: function(but) {
        but.removeCls('selected');
        if (but.editor) {
            but.editor.toTextArea();
        }
    }

});
