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
        var avatar = Docs.Comments.avatar(user.emailHash);
        this.update(avatar + '<div><span>' + user.userName + '</span> | <a href="#" class="logout">Logout</a></div>');
    },

    /**
     * Shows message about being currently logged out.
     */
    showLoggedOut: function() {
        this.update('<a href="#" class="login">Sign in / Register</a>');
    }

});
