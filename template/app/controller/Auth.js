/**
 * Authentication controller.
 *
 * Here we just bind together the Docs.Auth and AuthForm component.
 */
Ext.define('Docs.controller.Auth', {
    extend: 'Ext.app.Controller',

    requires: [
        'Docs.Auth'
    ],

    refs: [
        {
            ref: 'authForm',
            selector: 'authForm'
        }
    ],

    init: function() {
        Docs.Auth.on("initialized", function() {
            if (Docs.Auth.isLoggedIn()) {
                this.setLoggedIn();
            }
            else {
                this.setLoggedOut();
            }
        }, this);

        this.control({
            'authForm': {
                login: this.login,
                logout: this.logout
            }
        });
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
