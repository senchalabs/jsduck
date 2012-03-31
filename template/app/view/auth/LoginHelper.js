/**
 * Generates the login form for both in header and at the end of
 * comments list.
 *
 * When form is submitted, Docs.controller.Auth#login method is called.
 */
Ext.define('Docs.view.auth.LoginHelper', {
    singleton: true,

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
     * Renders the form inside Login component in header.
     * @param {Ext.Element/HTMLElement} el
     */
    renderToHeader: function(el) {
        var tpl = Ext.create('Ext.Template', this.loginTplHtml.join(''));
        tpl.overwrite(el, {});
        this.bindSubmit(el);
    },

    /**
     * Renders the form at the end of comments list.
     * @param {Ext.Element/HTMLElement} el
     */
    renderToComments: function(el) {
        if (Ext.isIE && Ext.ieVersion <= 7) {
            var tpl = Ext.create('Ext.XTemplate',
                '<div class="new-comment">',
                    '<span class="toggleNewComment"><span></span>Sorry, ',
                    'adding comments is not supported in IE 7 or earlier</span>',
                '</div>'
            );
        }
        else {
            var tpl = Ext.create('Ext.XTemplate',
                '<div class="new-comment">',
                    '<span class="toggleNewComment"><span></span>Sign in to post a comment:</span>',
                    this.loginTplHtml.join(''),
                '</div>'
            );
        }
        tpl.overwrite(el, {});
        this.bindSubmit(el);
    },

    bindSubmit: function(el) {
        Ext.get(el).down("form").on("submit", this.submitLogin, this, {preventDefault: true});
    },

    // Gathers values from form and passes to Auth controller
    submitLogin: function(event, el) {
        var form = Ext.get(el);
        var username = form.down('input[name=username]').getValue();
        var password = form.down('input[name=password]').getValue();
        var rememberEl = form.down('input[name=remember]');
        var submitEl = form.down('input[type=submit]');

        var remember = rememberEl ? Boolean(rememberEl.getAttribute('checked')) : false;

        Docs.App.getController('Auth').login(username, password, remember, submitEl);
    }

});
