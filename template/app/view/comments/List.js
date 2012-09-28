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
        'Docs.view.comments.Template'
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

        this.tpl = Docs.view.comments.Template;

        this.callParent(arguments);

        this.on("refresh", this.syntaxHighlight, this);
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
    },

    syntaxHighlight: function() {
        Docs.Syntax.highlight(this.getEl());
    }

});
