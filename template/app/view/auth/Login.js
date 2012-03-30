/**
 * View for login form.
 */
Ext.define('Docs.view.auth.Login', {
    extend: 'Ext.container.Container',
    alias: 'widget.authentication',

    loginTplHtml: [
        '<form class="loginForm" method="POST">',
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
        this.getEl().down("form").on("submit", this.submitLogin, this, {preventDefault: true});
    },

    submitLogin: function(event, el) {
        var form = Ext.get(el),
            username = form.down('input[name=username]').getValue(),
            password = form.down('input[name=password]').getValue(),
            rememberEl = form.down('input[name=remember]'),
            submitEl = form.down('input[type=submit]');

        var remember = rememberEl ? Boolean(rememberEl.getAttribute('checked')) : false;

        Docs.App.getController('Auth').login(username, password, remember, submitEl);
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
