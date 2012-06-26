/**
 * Authentication with a vBulletin user database
 */

var crypto = require('crypto'),
    _ = require('underscore');

var ForumUser = exports.ForumUser = function(client) {
    this.client = client;
};

ForumUser.prototype = {

    login: function(username, password, callback) {
        var sql = "SELECT userid, usergroupid, membergroupids, email, username, password, salt FROM user WHERE username = ?",
            self = this;

        this.client.query(sql, [username], function(err, results, fields) {
            if (err) {
                callback(err);
                return;
            }

            if (results.length == 0) {
                callback("No such user");
                return;
            }

            var user = results[0];

            if (!self.checkPassword(password, user.salt, user.password)) {
                callback("Invalid password");
                return;
            }

            user.moderator = self.isModerator(user);

            callback(null, user);
        });
    },

    clientUser: function(user) {
        return {
            emailHash: crypto.createHash('md5').update(user.email).digest("hex"),
            userName: user.username,
            userId: user.userid,
            mod: user.moderator
        };
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
            var ids = _.map(user.membergroupids.split(','), parseInt);
        }
        else {
            var ids = [];
        }

        return _.include(ids, COMMUNITY_SUPPORT_TEAM) || _.include(ids, DEV_TEAM);
    }
};
