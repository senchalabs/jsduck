/**
 * View for login form in header.
 */
Ext.define('Docs.view.auth.Login', {
    extend: 'Ext.container.Container',
    alias: 'widget.authentication',
    requires: 'Docs.view.auth.LoginHelper',

    /**
     * Shows login form.
     */
    showLoginForm: function() {
        Docs.view.auth.LoginHelper.renderToHeader(this.getEl());
    },

    /**
     * Shows message about who's logged in.
     * @param {String} username
     */
    showLoggedIn: function(username) {
        this.update('Welcome, ' + username + ' | <a href="#" class="logout">Logout</a>');
    },

    /**
     * Shows message about being currently logged out.
     */
    showLoggedOut: function() {
        this.update('<a href="#" class="login">Sign in / Register</a>');
    }

});
