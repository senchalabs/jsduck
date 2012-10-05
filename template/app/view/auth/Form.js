/**
 * View for login form at the end of comments.
 */
Ext.define('Docs.view.auth.Form', {
    extend: 'Docs.view.auth.BaseForm',
    alias: 'widget.authForm',
    cls: "new-comment",

    initComponent: function() {
        this.html = [
            '<span class="toggleNewComment"><span></span>Sign in to post a comment:</span>',
            this.createLoginFormHtml()
        ];

        this.callParent(arguments);
    },

    afterRender: function() {
        this.callParent(arguments);

        this.bindFormSubmitEvent();
    }

});
