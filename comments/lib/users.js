/**
 * Manages users table, logging in users and adding new users.
 */
function Users(db, forumAuth) {
    this.db = db;
    this.forumAuth = forumAuth;
}

Users.prototype = {
    /**
     * Authenticates against forum database and when successful
     * ensures the user is also listed in comments database. Returns
     * the comments database user record.
     *
     * @param {String} username
     * @param {String} password
     * @param {Function} callback Called when done.
     * @param {String} callback.err Error message when login failed.
     * @param {Object} callback.user The user that was logged in.
     */
    login: function(username, password, callback) {
        this.forumAuth.login(username, password, function(err, user) {
            if (err) {
                callback(err);
                return;
            }

            this.ensure(user, function(err, user_id) {
                user.id = user_id;
                callback(err, user);
            });
        }.bind(this));
    },

    /**
     * True if the user can modify the comment.  Normal user can
     * modify his own comments, but moderators can modify all
     * comments.
     *
     * @param {Object} user User record.
     * @param {Object} comment Comment record.
     * @return {Boolean}
     */
    canModify: function(user, comment) {
        return user.moderator || user.id == comment.user_id;
    },

    ensure: function(user, callback) {
        // first try to insert. If that fails, the user already
        // exists and we can instead look it up. If insert succeeds,
        // great also.
        this.add(user, function(err, user_id) {
            if (err) {
                this.get(user, function(err, localUser) {
                    // It might be that user has changed his e-mail
                    // address in the forum database. In such case
                    // update the local e-mail address accordingly.
                    if (user.email === localUser.email) {
                        callback(err, localUser.id);
                    }
                    else {
                        this.updateEmail(localUser.id, user.email, function(err) {
                            callback(err, localUser.id);
                        });
                    }
                }.bind(this));
            }
            else {
                callback(err, user_id);
            }
        }.bind(this));
    },

    add: function(user, callback) {
        this.db.insert("users", user, callback);
    },

    get: function(user, callback) {
        this.db.queryOne('SELECT * FROM users WHERE external_id = ?', [user.external_id], callback);
    },

    updateEmail: function(user_id, email, callback) {
        this.db.update("users", {id: user_id, email: email}, callback);
    }

};

module.exports = Users;
