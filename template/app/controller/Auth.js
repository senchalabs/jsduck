/**
 * Authentication controller.
 *
 * Here we just bind together the Docs.Auth and AuthForm component.
 */
Ext.define('Docs.controller.Auth', {
    extend: 'Ext.app.Controller',

    requires: [
        'Docs.Auth',
        'Docs.Comments'
    ],

    refs: [
        {
            ref: 'authForm',
            selector: 'authForm'
        }
    ],

    init: function() {
        this.control({
            'authForm': {
                login: this.login,
                logout: this.logout
            }
        });

        // HACK:
        // Because the initialization of comments involves adding an
        // additional tab, we need to ensure that we do this addition
        // after Tabs controller has been launched.
        var tabs = this.getController("Tabs");
        tabs.onLaunch = Ext.Function.createSequence(tabs.onLaunch, this.afterTabsLaunch, this);
    },

    afterTabsLaunch: function() {
        if (Docs.Comments.isEnabled()) {
            if (Docs.Auth.isLoggedIn()) {
                this.setLoggedIn();
            }
            else {
                this.setLoggedOut();
            }
        }
    },

    login: function(username, password, remember) {
        Docs.Auth.login({
            username: username,
            password: password,
            remember: remember,
            success: this.setLoggedIn,
            failure: function(reason) {
                this.getAuthForm().showMessage(reason);
            },
            scope: this
        });
    },

    logout: function() {
        Docs.Auth.logout(this.setLoggedOut, this);
    },

    setLoggedIn: function() {
        this.getAuthForm().showLoggedIn(Docs.Auth.getUser().userName);
        this.getController("Tabs").showCommentsTab();
    },

    setLoggedOut: function(user) {
        this.getAuthForm().showLoggedOut();
        this.getController("Tabs").hideCommentsTab();
    }

});
