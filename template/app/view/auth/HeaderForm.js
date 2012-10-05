/**
 * View for login form in header.
 */
Ext.define('Docs.view.auth.HeaderForm', {
    extend: 'Ext.container.Container',
    alias: 'widget.authHeaderForm',
    requires: [
        'Docs.Tip',
        'Docs.Comments'
    ],

    loginTplHtml: [
        '<form class="loginForm">',
            '<input class="username" type="text" name="username" placeholder="Username" />',
            '<input class="password" type="password" name="password" placeholder="Password" />',
            '<label><input type="checkbox" name="remember" /> Remember Me</label>',
            '<input class="submit" type="submit" value="Sign in" />',
            ' or ',
            '<a class="register" href="http://www.sencha.com/forum/register.php" target="_blank">Register</a>',
        '</form>'
    ],

    /**
     * @event login
     * Fires when user fills in username and password and presses
     * submit button.
     * @param {Docs.view.auth.HeaderForm} form
     * @param {String} username
     * @param {String} password
     * @param {Boolean} remember True when remember-me checked.
     */

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
        var tpl = Ext.create('Ext.Template', this.loginTplHtml.join(''));
        tpl.overwrite(this.getEl(), {showLabel: this.showLabel});
        this.bindSubmit();
    },

    bindSubmit: function() {
        this.getEl().down("form").on("submit", this.submitLogin, this, {preventDefault: true});
    },

    // Gathers values from form and fires login event.
    submitLogin: function(event, el) {
        var form = Ext.get(el);
        var username = form.down('input[name=username]').getValue();
        var password = form.down('input[name=password]').getValue();
        var rememberEl = form.down('input[name=remember]');

        var remember = rememberEl ? !!(rememberEl.getAttribute('checked')) : false;

        this.fireEvent("login", this, username, password, remember);
    },

    /**
     * Shows the login failure message.
     * @param {String} msg
     */
    showMessage: function(msg) {
        var submitEl = this.getEl().down('input[type=submit]');
        Docs.Tip.show(msg, submitEl, 'bottom');
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
