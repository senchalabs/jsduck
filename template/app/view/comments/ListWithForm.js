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
        'Docs.Auth'
    ],

    initComponent: function() {
        this.items = [
            {
                xtype: 'commentsList'
            },
            {
                xtype: 'commentsForm',
                user: Docs.Auth.getUser()
            }
        ];

        this.callParent(arguments);
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
