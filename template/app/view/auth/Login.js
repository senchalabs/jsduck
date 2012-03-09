/**
 * View for login form.
 */
Ext.define('Docs.view.auth.Login', {
    extend: 'Ext.container.Container',
    alias: 'widget.authentication',

    loginTplHtml: [
        '<form class="loginForm" onsubmit="return Docs.App.getController(\'Auth\').submitLogin(this);">',
            '<input class="username" type="text" name="username" placeholder="Username" />',
            '<input class="password" type="password" name="password" placeholder="Password" />',
            '<label><input type="checkbox" name="remember" /> Remember Me</label>',
            '<input class="submit" type="submit" value="Sign in" />',
            ' or ',
            '<a class="register" href="http://www.sencha.com/forum/register.php" target="_blank">Register</a>',
        '</form>'
    ],

    initComponent: function() {
        this.loginTpl = Ext.create('Ext.Template', this.loginTplHtml.join(''));
        this.callParent(arguments);
    },

    /**
     * Shows login form.
     */
    showLoginForm: function() {
        this.update(this.loginTpl.apply());
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
