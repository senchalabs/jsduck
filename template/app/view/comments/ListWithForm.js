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
        'Docs.view.auth.Form',
        'Docs.Comments',
        'Docs.Auth'
    ],
    componentCls: "comments-list-with-form",

    /**
     * @cfg {String[]} target
     * The target of the comments (used for posting new comment).
     */
    /**
     * @cfg {Number} parentId
     * ID of parent comment.
     */
    /**
     * @cfg {String} newCommentTitle
     * A custom title for the new comment form.
     */

    initComponent: function() {
        this.items = [
            this.list = new Docs.view.comments.List({
                enableDragDrop: true
            })
        ];

        /**
         * @event countChange
         * @inheritdoc Docs.view.comments.List#countChange
         */
        /**
         * @event reorder
         * @inheritdoc Docs.view.comments.List#reorder
         */
        this.relayEvents(this.list, ["countChange", "reorder"]);

        this.callParent(arguments);
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     * @param {Boolean} append True to append the comments to existing ones.
     */
    load: function(comments, append) {
        this.list.load(comments, append);

        // Only show auth/comment form after the initial load.
        if (Docs.Auth.isLoggedIn()) {
            this.showCommentingForm();
        }
        else {
            this.showAuthForm();
        }
    },

    /**
     * Shows the login form.
     */
    showAuthForm: function() {
        if (this.commentingForm) {
            this.remove(this.commentingForm);
            delete this.commentingForm;
        }
        if (!this.authForm) {
            this.authForm = new Docs.view.auth.Form();
            this.add(this.authForm);
        }
    },

    /**
     * Shows the commenting form.
     */
    showCommentingForm: function() {
        if (this.authForm) {
            this.remove(this.authForm);
            delete this.authForm;
        }
        if (!this.commentingForm) {
            this.commentingForm = new Docs.view.comments.Form({
                title: this.newCommentTitle,
                user: Docs.Auth.getUser(),
                userSubscribed: Docs.Comments.hasSubscription(this.target),
                listeners: {
                    submit: this.postComment,
                    subscriptionChange: this.subscribe,
                    scope: this
                }
            });
            this.add(this.commentingForm);
        }
    },

    postComment: function(content) {
        Docs.Comments.post({
            target: this.target,
            parentId: this.parentId,
            content: content,
            callback: function(comment) {
                this.commentingForm.setValue('');
                this.list.load([comment], true);
            },
            scope: this
        });
    },

    subscribe: function(subscribed) {
        Docs.Comments.subscribe(this.target, subscribed, function() {
            this.commentingForm.showSubscriptionMessage(subscribed);
        }, this);
    }

});
