var DbFacade = require('./db_facade');
var Comments = require('./comments');
var Users = require('./users');
var Subscriptions = require('./subscriptions');
var ForumAuth = require('./forum_auth');
var config = require('./config');

/**
 * Produces instances of classes representing different tables.  Each
 * instance is factored only once and a cached instance is returned on
 * subsequent calls.
 *
 * @constructor
 * Initializes factory to work within a specific comments domain.
 * @param {String} domain
 */
function TableFactory(domain) {
    this.domain = domain;
}

TableFactory.prototype = {
    /**
     * Returns Comments instance.
     * @return {Comments}
     */
    comments: function() {
        return this.cache("comments", function() {
            return new Comments(this.database(), this.domain);
        });
    },

    /**
     * Returns Users instance.
     * @return {Users}
     */
    users: function() {
        return this.cache("users", function() {
            var forumAuth = new ForumAuth(new DbFacade(config.forumDb));
            return new Users(this.database(), forumAuth);
        });
    },

    /**
     * Returns Subscriptions instance.
     * @return {Subscriptions}
     */
    subscriptions: function() {
        return this.cache("subscriptions", function() {
            return new Subscriptions(this.database(), this.domain);
        });
    },

    database: function() {
        return this.cache("database", function() {
            return new DbFacade(config.mysql);
        });
    },

    cache: function(name, fn) {
        var key = "__" + name;
        if (!this[key]) {
            this[key] = fn.call(this);
        }
        return this[key];
    }
};

module.exports = TableFactory;
