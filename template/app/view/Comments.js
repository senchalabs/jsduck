Ext.define('Docs.view.Comments', {

    singleton: true,
    requires: ['Docs.view.auth.Login'],

    constructor: function() {

        var numComments = [
            '<tpl if="num &gt; 0">',
                'View {[values.num == 1 ? "1 comment" : values.num + " comments"]}',
            '</tpl>',
            '<tpl if="num == 0">',
                'No comments. Click to add',
            '</tpl>'
        ];

        this.numCommentsTpl = Ext.create('Ext.XTemplate',
            numComments.join('')
        );

        var commentsMeta = [
            '<div class="comments first-child" id="comments-{id}">',
                '<a href="#" class="side toggleComments"><span></span></a>',
                '<a href="#" class="name toggleComments">', numComments.join(''), '</a>',
            '</div>'
        ];

        this.classCommentsTpl = Ext.create('Ext.XTemplate',
            '<div id="m-comment">',
                '<h3 class="members-title">Comments</h3>',
                commentsMeta.join(''),
            '</div>'
        );
        this.commentsMetaTpl = Ext.create('Ext.XTemplate', commentsMeta.join(''));

        this.memberCommentsTpl = Ext.create('Ext.Template',
            '<span class="toggleMemberComments">{0}</span>'
        );

        var commentTplHtml = [
            '<div class="comment" id="{id}">',
                '<div class="com-meta">',
                    '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/{emailHash}',
                          '?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                    '<div class="author">{author}</div>',
                    '<tpl if="this.isMod() || this.isAuthor(values.author)"><a href="#" class="deleteComment">Delete</a></tpl>',
                    '<div class="time">{[this.date(values.createdAt)]}</div>',
                    '<div class="vote">',
                        '<a href="#" class="voteCommentUp{[values.upVote ? " selected" : ""]}" title="Vote Up">&nbsp;</a>',
                        '<span class="score">{score}</span>',
                        '<a href="#" class="voteCommentDown{[values.downVote ? " selected" : ""]}" title="Vote Down">&nbsp;</a>',
                    '</div>',
                '</div>',
                '<div class="content">{contentHtml}</div>',
            '</div>'
        ];

        var commentTplMethods = {
            date: function(date) {
                return Ext.Date.format(new Date(date), 'm/d/y');
            },
            isMod: function() {
                return Docs.App.getController('Auth').currentUser.mod;
            },
            isAuthor: function(author) {
                return Docs.App.getController('Auth').currentUser.userName == author;
            }
        };

        this.commentsTpl = Ext.create('Ext.XTemplate',
            '<div class="comment-list">',
                '<tpl for=".">',
                    commentTplHtml.join(''),
                '</tpl>',
                '<div class="new-comment-wrap"></div>',
            '</div>',
            commentTplMethods
        );

        this.commentTpl = Ext.create('Ext.XTemplate',
            commentTplHtml.join(''),
            commentTplMethods
        );

        this.loggedInCommentTpl = Ext.create('Ext.XTemplate',
            '<div class="new-comment{[values.hide ? "" : " open"]}">',
                '<a href="#" class="toggleNewComment"><span></span>Post a comment</a>',
                '<form class="newCommentForm">',
                    '<textarea></textarea>',
                    '<div class="com-meta">',
                        '<img class="avatar" width="25" height="25"',
                            ' src="http://www.gravatar.com/avatar/{emailHash}?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                        '<div class="author">Logged in as {userName}</div>',
                        '<a href="#" class="toggleCommentGuide">Toggle commenting guide</a>',
                        '<input type="submit" class="postComment" value="Post comment" />',
                    '</div>',
                    '<div class="commentGuideTxt" style="display: none">',
                        '<ul>',
                            '<li>Comments should be an <strong>extension</strong> of the documentation.</li>',
                            '<li>For any <em>questions</em> about code or usage, please use the <a href="http://www.sencha.com/forum" target="_blank">Forum</a>.</li>',
                            '<li>Comments may be edited or deleted at any time by a moderator.</li>',
                            '<li>Comments will be formatted using the Markdown syntax, eg:</li>',
                        '</ul>',
                        '<div class="markdown preview">',
                            '<h4>Markdown</h4>',
                            '<pre>',
                                "Here is a **bold** item\n",
                                "Here is an _italic_ item\n",
                                "Here is an `inline` code snippet\n",
                                "\n",
                                "    Indent with 4 spaces\n",
                                "    for a code snippet\n",
                                "\n",
                                "1. Here is a numbered list\n",
                                "2. Second numbered list item\n",
                                "\n",
                                "- Here is an unordered list\n",
                                "- Second unordered list item\n",
                            '</pre>',
                        '</div>',
                        '<div class="markdown result">',
                            '<h4>Result</h4>',
                            'Here is a <strong>bold</strong> item<br/>',
                            'Here is an <em>italic</em> item<br/>',
                            'Here is an <code>inline</code> code snippet<br/>',
                            '<pre>',
                            "Indent with 4 spaces\n",
                            "for a code snippet",
                            '</pre>',
                            '<ol>',
                                '<li>Here is a numbered list</li>',
                                '<li>Second numbered list item</li>',
                            '</ol>',
                            '<ul>',
                                '<li>Here is an unordered list</li>',
                                '<li>Second unordered list item</li>',
                            '</ul>',
                        '</div>',
                    '</div>',
                '</form>',
            '</div>'
        );

        if (Ext.isIE && Ext.ieVersion <= 7) {
            this.loggedOutCommentTpl = Ext.create('Ext.XTemplate',
                '<div class="new-comment">',
                    '<span class="toggleNewComment"><span></span>Sorry, adding comments is only supported in IE 8+</span>',
                '</div>'
            );
        } else {
            this.loggedOutCommentTpl = Ext.create('Ext.XTemplate',
                '<div class="new-comment">',
                    '<span class="toggleNewComment"><span></span>Sign in to post a comment:</span>',
                    Docs.view.auth.Login.prototype.loginTplHtml.join(''),
                '</div>'
            );
        }
    },

    /**
     * Renders the comment containers for the currently active class
     */
    renderClassCommentContainers: function(cls) {

        // Add comment button to class toolbar
        Ext.ComponentQuery.query('classoverview toolbar')[0].insert(-2, {
            xtype: 'container',
            id: 'classCommentToolbarBtn',
            width: 24,
            margin: '0 4 0 0',
            cls: 'comment-btn',
            html: '0'
        });

        // Insert class level comment container under class intro docs
        this.classCommentsTpl.insertFirst(Ext.query('.members')[0], {
            num: 0,
            id: 'class-' + cls.name.replace('.', '-')
        });

        // Add a comment container to each class member
        Ext.Array.each(Ext.query('.member .long'), function(memberDoc) {
            var id = Ext.get(memberDoc).up('.member').getAttribute('id');
            this.commentsMetaTpl.append(memberDoc, {
                num: 0,
                id: 'class-' + cls.name.replace(/\./g, '-') + '-' + id.replace(/\./g, '-')
            });
        }, this);
    },

    /**
     * Updates the comment meta information (i.e. number of comments) on a class page
     */
    updateClassCommentMeta: function(cls) {

        var clsMeta = Docs.commentMeta['class'][cls];
        if (clsMeta) {

            // Update toolbar icon
            Ext.getCmp('classCommentToolbarBtn').update(clsMeta['']);

            // Update class level comments meta
            this.numCommentsTpl.overwrite(Ext.get(Ext.query('#m-comment a.name')[0]), {
                num: clsMeta['']
            });

            // Update class member comments meta
            for (var memberId in clsMeta) {
                if (memberId == '' || memberId == 'total') continue;

                var memberEl = Ext.get(Ext.query('#' + memberId)[0]);

                if (memberEl) {
                    var commentsWrap = memberEl.down('.comments a.name'),
                        memberTitle = memberEl.down('.title'),
                        memberTitleComments = memberTitle.down('.toggleMemberComments');

                    this.numCommentsTpl.overwrite(commentsWrap, {
                        num: clsMeta[memberId]
                    });

                    if (memberTitleComments) {
                        memberTitleComments.update(clsMeta[memberId]);
                    } else {
                        this.memberCommentsTpl.append(memberTitle, [clsMeta[memberId]]);
                    }
                }
            }
        }

        this.updateClassIndex();
    },

    renderHoverMenuMeta: function(cmp) {

        var commentsMeta = Docs.App.getController('CommentsMeta').commentMeta;

        Ext.Array.each(cmp.query('a.docClass'), function(a) {
            var rel = a.getAttribute('rel').replace(/^([^-]+\-)/, ''),
                relEl = Ext.get(rel);

            if (relEl) {
                var docClass = relEl.down('.meta a.docClass'),
                    clsName = docClass.getAttribute('rel'),
                    memberId = clsName + '-' + rel;

                if (commentsMeta[memberId]) {
                    this.memberCommentsTpl.append(a, [commentsMeta[memberId] || 0]);
                }
            }
        }, this);
    },

    /**
     * Update the Class index with number of comments on each class
     */
    updateClassIndex: function() {
        for(var cls in Docs.commentMeta['class']) {
            var clsEl = Ext.get(Ext.query('#classindex a[rel="' + cls + '"]')[0]);
            if (clsEl) {
                var existingMeta = clsEl.down('.toggleMemberComments');
                if (existingMeta) {
                    existingMeta.update(String(Docs.commentMeta['class'][cls]['total']));
                } else {
                    Docs.view.Comments.memberCommentsTpl.append(clsEl, [String(Docs.commentMeta['class'][cls]['total'])]);
                }
            }
        }
    },

    renderNewCommentForms: function() {

        var currentUser = Docs.App.getController('Auth').currentUser;

        Ext.Array.each(Ext.query('.new-comment-wrap'), function(newComment) {
            if (Docs.App.getController('Auth').isLoggedIn()) {
                this.loggedInCommentTpl.overwrite(newComment, currentUser);
            } else {
                this.loggedOutCommentTpl.overwrite(newComment, {});
            }
        }, this);
    },

    showMember: function(cls, member) {

        var memberEl = Ext.get(member).down('.long'),
            id = ('class-' + cls + '-' + member).replace(/\./g, '-');

        if (!memberEl.hasCls('renderedComment')) {
            this.commentsMetaTpl.append(memberEl, {
                num: 0,
                id: id
            });
            memberEl.addCls('renderedComment');
            Docs.App.getController('CommentsMeta').commentIdMap['comments-' + id] = ['class', cls, member];
        }
    }
});