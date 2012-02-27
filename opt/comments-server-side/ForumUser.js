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

        this.client.query(sql, [username],

            function selectCb(err, results, fields) {
                if (err) {
                    callback(err);
                    return;
                }

                if (results.length == 0) {
                    callback("No such user");
                    return;
                }

                if (!self.checkPassword(password, results[0].salt, results[0].password)) {
                    callback("Invalid password");
                    return;
                }

                var user = self.getUserFromResult(results[0]);

                callback(null, user);
            }
        );
    },

    clientUser: function(user) {

        crypto.createHash('md5').update(user.email).digest("hex");

        return {
            emailHash: user.email,
            userName: user.username,
            userId: user.userid,
            mod: _.include(user.membergroupids, 7)
        };
    },

    checkPassword: function(password, salt, saltedPassword) {

        password = crypto.createHash('md5').update(password).digest("hex") + salt;
        password = crypto.createHash('md5').update(password).digest("hex");

        return password == saltedPassword;
    },

    getUserFromResult: function(result) {

        var ids, id;

        if (result.membergroupids) {
            ids = result.membergroupids.split(',');
            result.membergroupids = [];
            for (id in ids) {
                result.membergroupids.push(Number(ids[id]));
            }
        }

        result.moderator = _.include(result.membergroupids, 7);

        return result;
    }
};
