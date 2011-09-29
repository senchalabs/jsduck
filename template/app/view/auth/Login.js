Ext.define('Docs.view.auth.Login', {
    extend: 'Ext.container.Container',
    alias: 'widget.authentication',

    loginTplHtml: [
        '<form class="loginForm">',
            '<input class="username" type="text" name="username" placeholder="Username" />',
            '<input class="password" type="password" name="password" placeholder="Password" />',
            '<tpl if="remember">',
                '<label><input type="checkbox" name="remember" /> Remember Me</label>',
            '</tpl>',
            '<input class="submit" type="submit" value="Sign in" />',
            ' or ',
            '<a class="register" href="http://www.sencha.com/forum/register.php" target="_blank">Register</a>',
        '</form>'
    ],

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when the user clicks 'login'
             */
            "login",

            /**
             * @event
             * Fired when the user clicks 'logout'
             */
            "logout",

            /**
             * @event
             * Fired when the login form is submitted
             * @param {String} username
             * @param {String} password
             */
            "authenticate"
        );

        this.loginTpl = Ext.create('Ext.Template', this.loginTplHtml.join(''));

        this.callParent(arguments);

        Ext.getBody().addListener('submit', this.loginSubmit, this, {
            preventDefault: true,
            delegate: '.loginForm'
        });
    },

    showLogin: function() {
        this.update(this.loginTpl.apply());
    },

    showLoggedIn: function(username) {
        this.update('Welcome, ' + username + ' | <a href="#" class="logout">Logout</a>');
    },

    showLoggedOut: function(username) {
        this.update('<a href="#" class="login">Sign in / Register</a>');
    },

    loginSubmit: function(e, el) {

        var form = Ext.get(el),
            username = form.down('input[name=username]').getValue(),
            password = form.down('input[name=password]').getValue(),
            rememberEl = form.down('input[name=remember]'),
            submitEl = form.down('input[type=submit]')

        var remember = rememberEl ? Boolean(rememberEl.getAttribute('checked')) : false;

        this.fireEvent('login', username, password, remember, submitEl);
    }
});
