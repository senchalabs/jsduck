var crypto = require('crypto');

/**
 * Authentication with a Sencha Forum database
 */
function ForumAuth(db) {
    this.db = db;
}

ForumAuth.prototype = {
    /**
     * Attempts login with provided credentials.
     * @param {String} username
     * @param {String} password
     * @param {Function} callback Called when done.
     * @param {String} callback.err Error message when login failed.
     * @param {Object} callback.user The user that was logged in.
     */
    login: function(username, password, callback) {
        var sql = [
            "SELECT userid, membergroupids, email, username, password, salt",
            "FROM user",
            "WHERE username = ?"
        ];

        this.db.queryOne(sql, [username], function(err, user) {
            if (err) {
                callback(err);
                return;
            }

            if (!user) {
                callback("No such user");
                return;
            }

            if (!this.checkPassword(password, user.salt, user.password)) {
                callback("Invalid password");
                return;
            }

            callback(null, {
                username: user.username,
                external_id: user.userid,
                moderator: this.isModerator(user)
            });
        }.bind(this));
    },

    checkPassword: function(password, salt, saltedPassword) {
        password = crypto.createHash('md5').update(password).digest("hex") + salt;
        password = crypto.createHash('md5').update(password).digest("hex");

        return password == saltedPassword;
    },

    isModerator: function(user) {
        var COMMUNITY_SUPPORT_TEAM = 2;
        var DEV_TEAM = 19;

        if (typeof user.membergroupids === "string") {
            var ids = user.membergroupids.split(',').map(parseInt);
        }
        else {
            var ids = [];
        }

        return ids.indexOf(COMMUNITY_SUPPORT_TEAM) != -1 || ids.indexOf(DEV_TEAM) != -1;
    }
};

module.exports = ForumAuth;
