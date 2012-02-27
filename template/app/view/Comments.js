/**
 * View for rendering comments.
 */
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
            '<div class="comments-div first-child" id="comments-{id}">',
                '<a href="#" class="side toggleComments"><span></span></a>',
                '<a href="#" class="name toggleComments">', numComments.join(''), '</a>',
            '</div>'
        ];

        this.loadingTpl = Ext.create('Ext.Template',
            '<div class="loading">Loading...</div>'
        );

        this.classCommentsTpl = Ext.create('Ext.XTemplate',
            '<div class="comments-section">',
                '<h3 class="members-title icon-comment">Comments</h3>',
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
                    '<div class="author<tpl if="moderator"> moderator" title="Sencha Engineer</tpl>">',
                        '{author}',
                        '<tpl if="showCls">',
                            '<span class="target"> on {[this.target(values.target)]}</span>',
                        '</tpl>',
                        '<tpl if="action == \'problem\'">',
                            '<span class="problem">problem</span>',
                        '</tpl>',
                    '</div>',
                    '<tpl if="this.isMod() || this.isAuthor(values.author)"><a href="#" class="editComment">Edit</a><a href="#" class="deleteComment">Delete</a></tpl>',
                    '<div class="time" title="{[this.date(values.createdAt)]}">{[this.dateStr(values.createdAt)]}</div>',
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
            dateStr: function(date) {
                try {
                    var now = Math.ceil(Number(new Date()) / 1000),
                        comment = Math.ceil(Number(new Date(date)) / 1000),
                        diff = now - comment,
                        str;

                    if (diff < 60) {
                        return 'just now';
                    } else if (diff < 3600) {
                        str = String(Math.ceil(diff / (60)));
                        return str + (str == "1" ? ' minute' : ' minutes') + ' ago';
                    } else if (diff < 86400) {
                        str = String(Math.ceil(diff / (3600)));
                        return str + (str == "1" ? ' hour' : ' hours') + ' ago';
                    } else if (diff < 60*60*24*31) {
                        str = String(Math.ceil(diff / (60 * 60 * 24)));
                        return str + (str == "1" ? ' day' : ' days') + ' ago';
                    } else if (diff < 60*60*24*365) {
                        str = String(Math.ceil(diff / (60 * 60 * 24 * 31)));
                        return str + (str == "1" ? ' month' : ' months') + ' ago';
                    } else {
                        return Ext.Date.format(new Date(date), 'jS M \'y');
                    }
                } catch(e) {
                    return '';
                }
            },
            date: function(date) {
                try {
                    return Ext.Date.format(new Date(date), 'jS F Y g:ia');
                } catch(e) {
                    return '';
                }
            },
            isMod: function() {
                return Docs.App.getController('Auth').currentUser.mod;
            },
            isAuthor: function(author) {
                return Docs.App.getController('Auth').currentUser.userName == author;
            },
            target: function(target) {
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

                return '<a href="' + urlPrefix + url + '">' + title + '</a>';
            },
            moreComments: function(values) {
                var values = values[values.length - 1];
                if (values && values.total_rows > (values.offset + values.limit)) {
                    return [
                        '<a href="#" class="fetchMoreComments recent" rel="' + values.key.join(',') + '">',
                            '<span></span>Showing comments 1-' + (values.offset + values.limit) + ' of ' + values.total_rows + '. ',
                            'Click to load ' + values.limit + ' more...',
                        '</a>'
                    ].join('');
                } else {
                    return '';
                }
            }
        };

        this.commentsTpl = Ext.create('Ext.XTemplate',
            '<div class="comment-list">',
                '<tpl for=".">',
                    commentTplHtml.join(''),
                '</tpl>',
                '<div class="new-comment-wrap"></div>',
            '</div>',
            '{[this.moreComments(values)]}',
            commentTplMethods
        );

        this.appendCommentsTpl = Ext.create('Ext.XTemplate',
            '<tpl for=".">',
                commentTplHtml.join(''),
            '</tpl>',
            commentTplMethods
        );

        this.commentTpl = Ext.create('Ext.XTemplate',
            commentTplHtml.join(''),
            commentTplMethods
        );

        var commentMetaAndGuide = [
            '<div class="com-meta">',
                '<img class="avatar" width="25" height="25"',
                    ' src="http://www.gravatar.com/avatar/{emailHash}?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                '<div class="author">Logged in as {userName}</div>',
                '<label class="subscribe">',
                    'Email updates? <input type="checkbox" class="subscriptionCheckbox" <tpl if="userSubscribed">checked="checked"</tpl> /><span class="sep"> | </span>',
                '</label>',
                '<a href="#" class="toggleCommentGuide">Help</a>',
                '<input type="submit" class="sub {[values.updateComment ? "update" : "post"]}Comment" value="{[values.updateComment ? "Update" : "Post"]} comment" />',
                '<tpl if="updateComment">',
                    ' or <a href="#" class="cancelUpdateComment">cancel</a>',
                '</tpl>',
            '</div>',
            '<div class="commentGuideTxt" style="display: none">',
                '<ul>',
                    '<li>Comments should be an <strong>extension</strong> of the documentation.</li>',
                    '<li>For any <em>questions</em> about code or usage, please use the <a href="http://www.sencha.com/forum" target="_blank">Forum</a>.</li>',
                    '<li>Comments may be edited or deleted at any time by a moderator.</li>',
                    '<li>Avatars can be managed at <a href="http://www.gravatar.com" target="_blank">Gravatar</a> (use your forum email address).</li>',
                    '<li>Comments will be formatted using the Markdown syntax, eg:</li>',
                '</ul>',
                '<div class="markdown preview">',
                    '<h4>Markdown</h4>',
                    '<pre>',
                        "Here is a **bold** item\n",
                        "Here is an _italic_ item\n",
                        "Here is an `inline` code snippet\n",
                        "Here is a [Link](#!/api)\n",
                        "\n",
                        "    Indent with 4 spaces\n",
                        "    for a code snippet\n",
                        "\n",
                        "1. Here is a numbered list\n",
                        "2. Second numbered list item\n",
                        "\n",
                        "- Here is an unordered list\n",
                        "- Second unordered list item\n",
                        "\n",
                        "End a line with two spaces\n",
                        "to create a line break\n",
                    '</pre>',
                '</div>',
                '<div class="markdown result">',
                    '<h4>Result</h4>',
                    'Here is a <strong>bold</strong> item<br/>',
                    'Here is an <em>italic</em> item<br/>',
                    'Here is an <code>inline</code> code snippet<br/>',
                    'Here is a <a href="#!/api">Link</a><br/>',
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
                    'End a line with two spaces<br/>to create a line break<br/><br/>',
                '</div>',
                '<ul>',
                    '<li>Links will only work if they start with <code>#!/</code> or http://www.sencha.com',
                '</ul>',
            '</div>'
        ];

        this.loggedInCommentTpl = Ext.create('Ext.XTemplate',
            '<div class="new-comment{[values.hide ? "" : " open"]}">',
                '<form class="newCommentForm">',
                    '<span class="action">',
                        'Action: ',
                        '<select class="commentAction">',
                            '<option value="comment">Post a comment</option>',
                            '<option value="question">Ask a question</option>',
                            '<option value="problem">Report a problem</option>',
                        '</select>',
                    '</span>',
                    '<div class="note question" style="display: none;">',
                        'Please use the <a href="http://www.sencha.com/forum" target="_blank">Sencha Forum</a> ',
                        'to post questions. Questions posted on the Documentation may be deleted.</div>',
                    '<div class="note problem" style="display: none;">',
                        '<p>Please inform us of documentation problems:</p>',
                        '<ul>',
                            '<li>Typos</li>',
                            '<li>Incorrect information</li>',
                            '<li>Errors with examples</li>',
                        '</ul>',
                        '<p>For <b>SDK bugs</b>, please use the <a href="http://www.sencha.com/forum" target="_blank">Sencha Forum</a>.<br />',
                        '   For Docs App bugs, please use the <a href="https://github.com/senchalabs/jsduck/issues" target="_blank">GitHub Issue tracker</a>.</p>',
                    '</div>',
                    '<div class="note feedback" style="display: none;">',
                        '<p>Your feedback will <b>not appear</b> online and you are unlikely to receive a personal response. ',
                            'However feedback is monitored closely by the Sencha Documentation team.</p>',
                        '<div style="padding-bottom: 5px;">Quality of documentation:</div>',
                        '<p>',
                            '<label><input name="feedback" type="radio" value="4" /> Excellent</label>',
                            '<label><input name="feedback" type="radio" value="3" /> Good</label>',
                            '<label><input name="feedback" type="radio" value="2" /> Fair</label>',
                            '<label><input name="feedback" type="radio" value="1" /> Poor</label>',
                        '</p>',
                        '<p>Comments or suggestions:</p>',
                    '</div>',
                    '<div class="postCommentWrap">',
                        '<textarea></textarea>',
                        commentMetaAndGuide.join(''),
                    '</div>',
                '</form>',
            '</div>'
        );

        this.editCommentTpl = Ext.create('Ext.XTemplate',
            '<form class="editCommentForm">',
                '<span class="action">Edit comment</span>',
                '<textarea>{content}</textarea>',
                commentMetaAndGuide.join(''),
            '</form>'
        );

        if (Ext.isIE && Ext.ieVersion <= 7) {
            this.loggedOutCommentTpl = Ext.create('Ext.XTemplate',
                '<div class="new-comment">',
                    '<span class="toggleNewComment"><span></span>Sorry, adding comments is not supported in IE 7 or earlier</span>',
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
            id: 'class-' + cls.name.replace(/\./g, '-')
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

        if (clsMeta && clsMeta['']) {

            // Update toolbar icon
            Ext.getCmp('classCommentToolbarBtn').update(clsMeta['']);

            // Update class level comments meta
            this.numCommentsTpl.overwrite(Ext.get(Ext.query('.comments-section a.name')[0]), {
                num: clsMeta['']
            });
        } else {
            // Update toolbar icon
            Ext.getCmp('classCommentToolbarBtn').update('0');

            // Update class level comments meta
            this.numCommentsTpl.overwrite(Ext.get(Ext.query('.comments-section a.name')[0]), {
                num: 0
            });
        }

        // Update class member comments meta
        Ext.Array.each(Ext.query('.member'), function(memberDom) {
            var memberEl = Ext.get(memberDom),
                memberId = memberEl.getAttribute('id'),
                memberCls = memberEl.down('.meta .defined-in').getAttribute('rel'),
                commentsWrap = memberEl.down('.comments-div a.name'),
                memberTitle = memberEl.down('.title'),
                numComments = Docs.commentMeta['class'][memberCls] && Docs.commentMeta['class'][memberCls][memberId],
                memberTitleComments = memberTitle.down('.toggleMemberComments');

            if (numComments) {
                this.numCommentsTpl.overwrite(commentsWrap, {
                    num: numComments
                });

                if (memberTitleComments) {
                    memberTitleComments.update(String(numComments));
                } else {
                    this.memberCommentsTpl.append(memberTitle, [numComments]);
                }
            } else {
                if (memberTitleComments) memberTitleComments.remove();
            }

        }, this);

        this.updateClassIndex();
        Ext.Array.each(Ext.ComponentQuery.query('hovermenu'), function(m) {
            m.fireEvent('refresh', this);
        });
    },

    updateGuideCommentMeta: function(guide) {
        var guideMeta = Docs.commentMeta['guide'][guide];

        this.numCommentsTpl.overwrite(Ext.get(Ext.query('#guide .comments-section a.name')[0]), {
            num: guideMeta && guideMeta[''] ? guideMeta[''] : 0
        });
    },

    updateVideoCommentMeta: function(video) {
        var videoMeta = Docs.commentMeta['video'][video];

        this.numCommentsTpl.overwrite(Ext.get(Ext.query('#video .comments-section a.name')[0]), {
            num: videoMeta && videoMeta[''] ? videoMeta[''] : 0
        });
    },

    renderHoverMenuMeta: function(cmp) {
        Ext.Array.each(cmp.query('a.docClass'), function(a) {
            var rel = "comments-class-" + a.getAttribute('rel').replace(/[^A-Za-z\-]/g, '-'),
                relEl = Ext.get(a),
                memberComments = relEl.down('.toggleMemberComments'),
                key = Docs.commentMeta.idMap[rel];

            if (key && Docs.commentMeta[key[0]] && Docs.commentMeta[key[0]][key[1]]) {
                var meta = Docs.commentMeta[key[0]][key[1]][key[2]];

                if (memberComments) {
                    if (!meta) {
                        memberComments.remove();
                    } else {
                        memberComments.update(String(meta));
                    }
                } else if (meta) {
                    this.memberCommentsTpl.append(a, [meta || 0]);
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
            var hideCommentForm = Ext.get(newComment).up('.comment-list').parent().hasCls('hideCommentForm');

            if (hideCommentForm) {
                // Do nothing
            } else if (Docs.App.getController('Auth').isLoggedIn()) {
                var wrap = this.loggedInCommentTpl.overwrite(newComment, currentUser, true),
                    textarea = wrap.down('textarea').dom;

                this.makeCodeMirror(textarea, wrap);
            } else {
                this.loggedOutCommentTpl.overwrite(newComment, {});
            }
        }, this);
    },

    makeCodeMirror: function(textarea, form) {
        textarea.editor = CodeMirror.fromTextArea(textarea, {
            enterMode: "keep",
            mode: 'markdown',
            indentUnit: 4
        });

        var action = (form && form.down('.commentAction'));
        if (action) {
            action.on('change', function(evt, el) {
                var val = Ext.get(el).getValue();
                form.select('.note').setStyle({display: 'none'});
                if (val == "question") {
                    form.down('.note.question').setStyle({display: 'block'});
                    form.down('.postCommentWrap').setStyle({display: 'none'});
                } else {
                    form.down('.postCommentWrap').setStyle({display: 'block'});
                    if (val == "problem") {
                        form.down('.note.problem').setStyle({display: 'block'});
                    } else if (val == "feedback") {
                        form.down('.note.feedback').setStyle({display: 'block'});
                    }
                }
            });
        }
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
