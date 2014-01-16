/**
 * Shared functionality of Form and HeaderForm components.
 */
Ext.define('Docs.view.auth.BaseForm', {
    extend: 'Ext.Component',
    requires: [
        'Docs.Tip',
        'Docs.Auth'
    ],

    /**
     * @event login
     * Fires when user fills in username and password and presses
     * submit button.
     * @param {Docs.view.auth.BaseForm} form
     * @param {String} username
     * @param {String} password
     * @param {Boolean} remember True when remember-me checked.
     */

    /**
     * Creates the HTML to be used in login form.
     * @return {String}
     * @protected
     */
    createLoginFormHtml: function() {
        return [
            '<form class="loginForm">',
                '<input class="username" type="text" name="username" placeholder="Username" />',
                '<input class="password" type="password" name="password" placeholder="Password" />',
                '<label><input type="checkbox" name="remember" /> Remember Me</label>',
                '<input class="submit" type="submit" value="Sign in" />',
                ' or ',
                '<a class="register" href="' + Docs.Auth.getRegistrationUrl() + '" target="_blank">Register</a>',
            '</form>'
        ].join("");
    },

    /**
     * Call this after form HTML is rendered to set up submit listener
     * for the login form.
     * @protected
     */
    bindFormSubmitEvent: function() {
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
    }

});
