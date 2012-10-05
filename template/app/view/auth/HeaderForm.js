/**
 * View for login form in header.
 */
Ext.define('Docs.view.auth.HeaderForm', {
    extend: 'Docs.view.auth.BaseForm',
    alias: 'widget.authHeaderForm',
    requires: [
        'Docs.Comments'
    ],

    /**
     * @event logout
     * Fired when logout link clicked.
     * @param {Docs.view.auth.HeaderForm} form
     */

    afterRender: function() {
        this.callParent(arguments);

        this.getEl().addListener('click', this.showLoginForm, this, {
            preventDefault: true,
            delegate: '.login'
        });

        this.getEl().addListener('click', function() {
            this.fireEvent("logout", this);
        }, this, {
            preventDefault: true,
            delegate: '.logout'
        });
    },

    /**
     * Shows login form.
     */
    showLoginForm: function() {
        this.update(this.createLoginFormHtml());
        this.bindFormSubmitEvent();
    },

    /**
     * Shows message about who's logged in.
     * @param {Object} user
     */
    showLoggedIn: function(user) {
        var userSignature = Docs.Comments.avatar(user.emailHash) + ' ' + user.userName;
        this.update('<span>' + userSignature + '</span> | <a href="#" class="logout">Logout</a>');
    },

    /**
     * Shows message about being currently logged out.
     */
    showLoggedOut: function() {
        this.update('<a href="#" class="login">Sign in / Register</a>');
    }

});
