/**
 * Shows the listing of comments.
 */
Ext.define('Docs.view.comments.List', {
    extend: 'Ext.view.View',
    alias: 'widget.commentsList',
    requires: [
        'Docs.Auth',
        'Docs.Syntax'
    ],

    itemSelector: "div.comment",

    emptyText: '<div class="loading">Loading...</div>',
    deferEmptyText: false,

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                "id",
                "author",
                "emailHash",
                "moderator",
                "createdAt",
                "target",
                "score",
                "upVote",
                "downVote",
                "contentHtml"
            ]
        });

        this.tpl = [
            '<div class="comment-list">',
                '<tpl for=".">',
                '<div class="comment" id="{id}">',
                    '<div class="com-meta">',
                        '<img class="avatar" width="25" height="25" src="http://www.gravatar.com/avatar/{emailHash}',
                              '?s=25&amp;r=PG&amp;d=http://www.sencha.com/img/avatar.png">',
                        '<div class="author<tpl if="moderator"> moderator" title="Sencha Engineer</tpl>">',
                            '{author}',
                            '<tpl if="showCls">',
                                '<span class="target"> on {[this.target(values.target)]}</span>',
                            '</tpl>',
                        '</div>',
                        '<tpl if="this.isMod()">',
                            '<a href="#" class="readComment <tpl if="read">read</tpl>">Read</a>',
                        '</tpl>',
                        '<tpl if="this.isMod() || this.isAuthor(values.author)">',
                            '<a href="#" class="editComment">Edit</a><a href="#" class="deleteComment">Delete</a>',
                        '</tpl>',
                        '<div class="time" title="{[this.date(values.createdAt)]}">{[this.dateStr(values.createdAt)]}</div>',
                        '<div class="vote">',
                            '<a href="#" class="voteCommentUp{[values.upVote ? " selected" : ""]}" ',
                                        'title="Vote Up">&nbsp;</a>',
                            '<span class="score">{score}</span>',
                            '<a href="#" class="voteCommentDown{[values.downVote ? " selected" : ""]}" ',
                                        'title="Vote Down">&nbsp;</a>',
                        '</div>',
                    '</div>',
                    '<div class="content">{contentHtml}</div>',
                '</div>',
                '</tpl>',
                '<div class="new-comment-wrap"></div>',
            '</div>',
            '{[this.recentCommentsPager(values)]}',
            // to use all methods of this class inside the template
            this
        ];

        this.callParent(arguments);

        this.on("refresh", this.syntaxHighlight, this);
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     */
    load: function(comments) {
        // hide the spinning loader when no comments.
        if (comments.length === 0) {
            this.emptyText = "";
        }

        this.store.loadData(comments);
    },

    syntaxHighlight: function() {
        Docs.Syntax.highlight(this.getEl());
    },

    dateStr: function(date) {
        try {
            var now = Math.ceil(Number(new Date()) / 1000);
            var comment = Math.ceil(Number(new Date(date)) / 1000);
            var diff = now - comment;

            if (diff < 60) {
                return 'just now';
            }
            else if (diff < 60*60) {
                var str = String(Math.round(diff / (60)));
                return str + (str == "1" ? ' minute' : ' minutes') + ' ago';
            }
            else if (diff < 60*60*24) {
                var str = String(Math.round(diff / (60*60)));
                return str + (str == "1" ? ' hour' : ' hours') + ' ago';
            }
            else if (diff < 60*60*24*31) {
                var str = String(Math.round(diff / (60 * 60 * 24)));
                return str + (str == "1" ? ' day' : ' days') + ' ago';
            }
            else {
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
        return Docs.Auth.isModerator();
    },

    isAuthor: function(author) {
        return Docs.Auth.getUser().userName == author;
    },

    target: function(target) {
        var url = target[1],
        title = target[1],
        urlPrefix = '#!/api/';

        if (target[0] == 'video') {
            title = 'Video ' + title;
            urlPrefix = '#!/video/';
        }
        else if (target[0] == 'guide') {
            title = 'Guide ' + title;
            urlPrefix = '#!/guide/';
        }
        else if (target[2] != '') {
            url += '-' + target[2];
            if (target[0] == "class") {
                title += '#' + target[2].replace(/^.*-/, "");
            }
            else {
                title += ' ' + target[2];
            }
        }

        return '<a href="' + urlPrefix + url + '">' + title + '</a>';
    }

});
