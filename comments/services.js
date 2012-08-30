var DbFacade = require('./db_facade');
var Comments = require('./comments');
var Users = require('./users');
var ForumAuth = require('./forum_auth');
var config = require('./config');

/**
 * @class services
 * Methods to use as filters in express.
 */
module.exports = {
    /**
     * Adds comments service to request.
     */
    comments: function(req, res, next) {
        var db = new DbFacade(config.mysql);
        req.comments = new Comments(db, req.params.sdk+"-"+req.params.version);
        next();
    },

    /**
     * Adds users service to request.
     */
    users: function(req, res, next) {
        var forumAuth = new ForumAuth(new DbFacade(config.forumDb));
        req.users = new Users(new DbFacade(config.mysql), forumAuth);
        next();
    }
};
