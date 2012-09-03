var DbFacade = require('./db_facade');
var Comments = require('./comments');
var Users = require('./users');
var Subscriptions = require('./subscriptions');
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
    },

    /**
     * Adds subscriptions service to request.
     */
    subscriptions: function(req, res, next) {
        var db = new DbFacade(config.mysql);
        req.subscriptions = new Subscriptions(db, req.params.sdk+"-"+req.params.version);
        next();
    },

    /**
     * Requires that user is logged in.
     */
    requireLogin: function(req, res, next) {
        if (!req.session || !req.session.user) {
            res.json({success: false, reason: 'Forbidden'}, 403);
        }
        else {
            next();
        }
    }
};
