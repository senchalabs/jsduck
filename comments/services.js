var DbFacade = require('./db_facade');
var Comments = require('./comments');
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
    }
};
