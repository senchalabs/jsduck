/**
 * Manages authentication (login/logout) of user.
 */
Ext.define('Docs.Auth', {
    singleton: true,
    requires: [
        'Ext.Ajax',
        'Ext.util.Cookies'
    ],

    /**
     * Checks if a user is logged in server side and sets up a local
     * session if they are.
     *
     * @param {Function} callback Fired after init attempt finished.
     * @param {Boolean} callback.success True when session initialized.
     * @param {Object} scope
     */
    init: function(callback, scope) {
        Ext.Ajax.request({
            url: Docs.data.commentsUrl + '/session',
            params: { sid: this.getSid() },
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
                    }
                    callback.call(scope, true);
                }
                else {
                    callback.call(scope, false);
                }
            },
            scope: this
        });
    },

    /**
     * Attempts to log a user in.
     *
     * @param {Object} cfg
     * @param {String} cfg.username
     * @param {String} cfg.password
     * @param {Boolean} cfg.remember True if "Remember Me" was checked.
     * @param {Function} cfg.success Function to call when login succeeds.
     * @param {Function} cfg.failure Function to call when login fails.
     * @param {Function} cfg.failure.reason The failure message from backend.
     * @param {Object} cfg.scope Scope for both callbacks.
     */
    login: function(cfg) {
        Ext.Ajax.request({
            url: Docs.data.commentsUrl + '/login',
            method: 'POST',
            cors: true,
            params: {
                username: cfg.username,
                password: cfg.password
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (data.success) {
                    this.currentUser = data;
                    this.setSid(data.sessionID, cfg.remember);
                    cfg.success && cfg.success.call(cfg.scope);
                }
                else {
                    cfg.failure && cfg.failure.call(cfg.scope, data.reason);
                }
            },
            scope: this
        });
    },

    /**
     * Logs the current user out.
     * @param {Function} callback
     * @param {Object} scope
     */
    logout: function(callback, scope) {
        Ext.Ajax.request({
            url: Docs.data.commentsUrl + '/logout?sid=' + this.getSid(),
            method: 'POST',
            cors: true,
            callback: function() {
                this.currentUser = undefined;
                callback && callback.call(scope);
            },
            scope: this
        });
    },

    /**
     * Sets the session ID.
     * @param {String} sid  The session ID
     * @param {Boolean} remember  'Remember me' flag is set
     * @private
     */
    setSid: function(sid, remember) {
        this.sid = sid;

        if (sid) {
            var expires = null;
            if (remember) {
                expires = new Date();
                expires.setTime(expires.getTime() + (60 * 60 * 24 * 30 * 1000)); // 30 days
            }
            Ext.util.Cookies.set('sid', sid, expires);
        }
        else {
            Ext.util.Cookies.clear('sid');
        }
    },

    /**
     * Returns the current session ID.
     * @return {String}
     */
    getSid: function() {
        if (!this.sid) {
            this.sid = Ext.util.Cookies.get('sid');
        }
        return this.sid;
    },

    /**
     * Returns the record of currently logged in user.
     * @return {Object}
     */
    getUser: function() {
        return this.currentUser;
    },

    /**
     * True if a user is logged in.
     * @return {Boolean}
     */
    isLoggedIn: function() {
        return !!this.getUser();
    },

    /**
     * True if current user is moderator.
     * @return {Boolean}
     */
    isModerator: function() {
        return this.getUser() && this.getUser().mod;
    },

    /**
     * Returns the URL that takes user to registration form.
     * @return {String}
     */
    getRegistrationUrl: function() {
        return Docs.data.commentsUrl + "/register";
    }

});
