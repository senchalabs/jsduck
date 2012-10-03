/**
 * Container for listing of all the comments.
 * Sorted by date or votes.
 */
Ext.define('Docs.view.comments.ListWithForm', {
    extend: 'Ext.container.Container',
    alias: "widget.commentsListWithForm",
    requires: [
        'Docs.view.comments.List',
        'Docs.view.comments.Form',
        'Docs.Comments',
        'Docs.Auth'
    ],

    /**
     * @cfg {String[]} target
     * The target of the comments (used for posting new comment).
     */

    initComponent: function() {
        this.items = [
            this.list = new Docs.view.comments.List({
            }),
            this.form = new Docs.view.comments.Form({
                user: Docs.Auth.getUser(),
                listeners: {
                    submit: this.postComment,
                    scope: this
                }
            })
        ];

        this.callParent(arguments);
    },

    postComment: function(content) {
        Docs.Comments.post(this.target, content, function(comment) {
            this.form.setValue('');
            this.list.load([comment], true);
        }, this);
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     * @param {Boolean} append True to append the comments to existing ones.
     */
    load: function(comments, append) {
        this.down("commentsList").load(comments, append);
    }

});
