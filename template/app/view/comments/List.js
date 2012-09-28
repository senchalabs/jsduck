/**
 * Shows the listing of comments.
 */
Ext.define('Docs.view.comments.List', {
    extend: 'Ext.view.View',
    alias: 'widget.commentsList',
    requires: [
        'Docs.Auth',
        'Docs.Syntax',
        'Docs.Comments',
        'Docs.view.comments.Template',
        'Docs.Tip'
    ],

    itemSelector: "div.comment",

    emptyText: '<div class="loading">Loading...</div>',
    deferEmptyText: false,

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                "_id",
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

        this.tpl = Docs.view.comments.Template;

        this.callParent(arguments);

        this.on("refresh", function() {
            Docs.Syntax.highlight(this.getEl());
        }, this);
        this.on("itemupdate", function(record, index, node) {
            Docs.Syntax.highlight(node);
        }, this);
    },

    afterRender: function() {
        this.callParent(arguments);
        this.delegateClick("a.voteCommentUp", function(el, r) {
            this.vote(el, r, "up");
        }, this);
        this.delegateClick("a.voteCommentDown", function(el, r) {
            this.vote(el, r, "down");
        }, this);
    },

    delegateClick: function(selector, callback, scope) {
        this.getEl().on("click", function(event, el) {
            callback.call(scope, el, this.getRecord(this.findItemByChild(el)));
        }, this, {preventDefault: true, delegate: selector});
    },

    vote: function(el, record, direction) {
        if (!Docs.Auth.isLoggedIn()) {
            Docs.Tip.show('Please login to vote on this comment', el);
            return;
        }
        if (record.get("upVote") && direction === "up" || record.get("downVote") && direction === "down") {
            Docs.Tip.show('You have already voted on this comment', el);
            return;
        }

        Docs.Comments.request("ajax", {
            url: '/comments/' + record.get("_id"),
            method: 'POST',
            params: { vote: direction },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);

                if (data.success) {
                    record.set("score", data.total);
                    record.set("upVote", data.direction === "up");
                    record.set("downVote", data.direction === "down");
                    record.commit();
                }
                else {
                    Docs.Tip.show(data.reason, el);
                }
            },
            scope: this
        });
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     * @param {Boolean} append True to append the comments to existing ones.
     */
    load: function(comments, append) {
        // hide the spinning loader when no comments.
        if (comments.length === 0) {
            this.emptyText = "";
        }

        this.store.loadData(comments, append);
    }

});
