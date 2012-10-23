/**
 * Retrieving and posting Comments
 */
Ext.define('Docs.controller.Comments', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/comment',
    title: 'Comments',

    requires: [
        "Docs.Settings",
        "Docs.Comments"
    ],

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#commentindex'
        },
        {
            ref: 'commentsFullList',
            selector: 'commentsFullList'
        }
    ],

    // Recent comments query parameters that aren't saved into cookies.
    recentCommentsSettings: {},

    init: function() {
        this.control({
            'commentsFullList': {
                hideReadChange: function() {
                    this.fetchRecentComments();
                },
                sortOrderChange: function(orderBy) {
                    this.recentCommentsSettings.sortByScore = (orderBy === "votes");
                    this.fetchRecentComments();
                }
            },

            'commentsPager': {
                loadMore: function(offset) {
                    this.fetchRecentComments(offset);
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

            'commentsTags': {
                select: function(tag) {
                    this.recentCommentsSettings.tagname = tag && tag.get("tagname");
                    this.fetchRecentComments();
                }
            }
        });
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

    fetchRecentComments: function(offset) {
        var settings = Docs.Settings.get('comments');

        var params = {
            offset: offset || 0,
            limit: 100,
            hideRead: settings.hideRead ? 1 : undefined,
            sortByScore: this.recentCommentsSettings.sortByScore ? 1 : undefined,
            username: this.recentCommentsSettings.username,
            targetId: this.recentCommentsSettings.targetId,
            tagname: this.recentCommentsSettings.tagname
        };

        this.getCommentsFullList().setMasked(true);

        Docs.Comments.request("jsonp", {
            url: '/comments_recent',
            method: 'GET',
            params: params,
            success: function(comments) {
                this.getCommentsFullList().setMasked(false);
                var append = offset > 0;
                this.getCommentsFullList().load(comments, append);
            },
            scope: this
        });
    }
});
