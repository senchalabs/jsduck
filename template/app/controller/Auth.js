Ext.define('Docs.controller.Auth', {
    extend: 'Ext.app.Controller',

    requires: ['Ext.util.Cookies'],

    authServer: 'http://projects.sencha.com/auth',

    refs: [
         {
            ref: 'auth',
            selector: 'authentication'
        }
    ],

    init: function() {

        this.sid = Ext.util.Cookies.get('sid');

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
            "loggedOut"
        );

        this.control({
            'authentication': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(e, el) {
                        cmp.showLogin();
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

                    this.getSession();
                },
                login: this.login
            }
        });
    },

    /**
     * Checks if a user is logged in server side and sets up a local session if they are.
     */
    getSession: function() {

        // if (window.XDomainRequest) {
        //     xdr = new XDomainRequest();
        //     if (xdr) {
        //         xdr.onerror = function() { alert("XDR onerror"); };
        //         xdr.ontimeout =  function() { alert("XDR timeout"); };
        //         xdr.onload =  function() { alert("XDR load " + xdr.responseText); };
        //
        //         xdr.timeout = 2000;
        //         xdr.open('POST', 'http://projects.sencha.com/auth/login');
        //         xdr.send('username=hmm&password=hmm');
        //     } else {
        //         alert('Failed to create');
        //     }
        // }

        Ext.Ajax.request({
            url: this.authServer + '/session',
            params: { sid: this.sid },
            method: 'GET',
            cors: true,
            callback: function(options, success, response) {
                if (success) {
                    this.currentUser = JSON.parse(response.responseText);

                    if (this.currentUser) {
                        this.loggedIn();
                    } else {
                        this.getAuth().showLoggedOut();
                    }
                }
            },
            scope: this
        });
    },

    /**
     * Authenticates a user
     * @param {String} username
     * @param {String} password
     * @param {Boolean} remember
     * @param {Ext.Element} submitEl
     */
    login: function(username, password, remember, submitEl) {

        Ext.Ajax.request({
            url: this.authServer + '/login',
            method: 'POST',
            cors: true,
            params: {
                username: username,
                password: password
            },
            callback: function(options, success, response) {
                var data = JSON.parse(response.responseText);
                if (data.success) {
                    this.currentUser = data;
                    this.setSid(data.sessionID, { remember: remember });
                    this.loggedIn();
                } else {
                    if (this.errorTip) {
                        this.errorTip.update(data.reason);
                        this.errorTip.setTarget(submitEl);
                        this.errorTip.show();
                    } else {
                        this.errorTip = Ext.create('Ext.tip.ToolTip', {
                            anchor: 'bottom',
                            target: submitEl,
                            html: data.reason
                        });
                        this.errorTip.show();
                    }
                }
            },
            scope: this
        });
    },

    /**
     * Logs out a user
     */
    logout: function() {
        Ext.Ajax.request({
            url: this.authServer + '/logout?sid=' + this.sid,
            method: 'POST',
            cors: true,
            callback: function(){
                this.loggedOut();
            },
            scope: this
        });
    },

    /**
     * Marks the user as logged in.
     */
    loggedIn: function() {
        if (this.currentUser) {
            this.getAuth().showLoggedIn(this.currentUser.userName);
            this.fireEvent('loggedIn');
        }
    },

    /**
     * Marks a user as logged out.
     */
    loggedOut: function(user) {
        this.currentUser = {};
        this.setSid(null)
        this.getAuth().showLoggedOut();
        this.fireEvent('loggedOut');
    },

    /**
     * Checks if a user is logged in.
     * @return {Boolean} true if the user is logged in
     */
    isLoggedIn: function() {
        return Boolean(this.sid);
    },

    setSid: function(sid, opts) {
        this.sid = sid;
        if (sid && opts && opts.remember) {
            Ext.util.Cookies.set('sid', sid);
        } else {
            Ext.util.Cookies.clear('sid');
        }
    }
});
