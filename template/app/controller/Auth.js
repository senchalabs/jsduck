/**
 * Authentication controller.
 */
Ext.define('Docs.controller.Auth', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.util.Cookies',
        'Docs.Tip'
    ],

    refs: [
        {
            ref: 'auth',
            selector: 'authentication'
        }
    ],

    init: function() {
        this.sid = Ext.util.Cookies.get('sid');
        this.currentUser = {};

        this.addEvents(
            /**
             * @event loggedIn
             * Fired after user logs in
             */
            "loggedIn",

            /**
             * @event loggedOut
             * Fired after user logs out
             */
            "loggedOut",

            /**
             * @event available
             * Fired if the authorisation is available
             */
            "available"
        );

        if (!Docs.enableComments) {
            return;
        }

        this.control({
            'authentication': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(e, el) {
                        cmp.showLoginForm();
                    }, this, {
                        preventDefault: true,
                        delegate: '.login'
                    });

                    cmp.el.addListener('click', function(e, el) {
                        this.logout();
                    }, this, {
                        preventDefault: true,
                        delegate: '.logout'
                    });

                    this.retrieveSession();
                }
            }
        });
    },

    /**
     * Checks if a user is logged in server side and sets up a local
     * session if they are.
     * @private
     */
    retrieveSession: function() {
        Ext.Ajax.request({
            url: Docs.baseUrl + '/session',
            params: { sid: this.sid },
            method: 'GET',
            cors: true,
            callback: function(options, success, response) {
                if (response && response.responseText) {
                    var data = Ext.JSON.decode(response.responseText);

                    if (data && data.sessionID) {
                        this.setSid(data.sessionID);
                    }

                    if (data && data.userName) {
                        this.currentUser = data;
                        this.setLoggedIn();
                    } else {
                        this.setLoggedOut();
                    }

                    this.fireEvent('available');
                }
            },
            scope: this
        });
    },

    /**
     * Authenticates a user
     * @param {String} username
     * @param {String} password
     * @param {Boolean} remember True if "Remember Me" was checked.
     * @param {Ext.Element} tipTarget Target where to anchor login failure messages.
     */
    login: function(username, password, remember, tipTarget) {
        Ext.Ajax.request({
            url: Docs.baseUrl + '/login',
            method: 'POST',
            cors: true,
            params: {
                username: username,
                password: password
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    this.currentUser = data;
                    this.setSid(data.sessionID, { remember: remember });
                    this.setLoggedIn();
                } else {
                    Docs.Tip.show(data.reason, tipTarget, 'bottom');
                }
            },
            scope: this
        });
    },

    /**
     * Logs out a user
     * @private
     */
    logout: function() {
        Ext.Ajax.request({
            url: Docs.baseUrl + '/logout?sid=' + this.sid,
            method: 'POST',
            cors: true,
            callback: function(){
                this.setLoggedOut();
            },
            scope: this
        });
    },

    /**
     * Marks the user as logged in.
     * @private
     */
    setLoggedIn: function() {
        if (this.currentUser) {
            this.getAuth().showLoggedIn(this.currentUser.userName);
            this.fireEvent('loggedIn');
        }
    },

    /**
     * Marks a user as logged out.
     * @private
     */
    setLoggedOut: function(user) {
        this.currentUser = {};
        this.getAuth().showLoggedOut();
        this.fireEvent('loggedOut');
    },

    /**
     * Checks if a user is logged in.
     * @return {Boolean} true if the user is logged in
     */
    isLoggedIn: function() {
        return !!this.currentUser.userName;
    },

    /**
     * True when current user is moderator.
     * @return {Boolean}
     */
    isModerator: function() {
        return this.currentUser.mod;
    },

    /**
     * Sets the session ID.
     * @param {String} sid  The session ID
     * @param {Object} opts (optional)
     * @param {Boolean} opts.remember  'Remember me' flag is set
     */
    setSid: function(sid, opts) {

        this.sid = sid;

        if (sid) {
            var expires = null;
            if (opts && opts.remember) {
                expires = new Date();
                expires.setTime(expires.getTime() + (60 * 60 * 24 * 30 * 1000)); // 30 days
            }
            Ext.util.Cookies.set('sid', sid, expires);
        } else {
            Ext.util.Cookies.clear('sid');
        }
    }

});
