var Request = require("./request");

/**
 * @singleton
 * Performs authentication and authorization related checks.
 */
var Auth = {
    /**
     * Throws error when user is not logged in.
     */
    isLoggedIn: function(req, res, next) {
        var r = new Request(req);
        if (!r.isLoggedIn()) {
            res.json({success: false, reason: 'Forbidden'}, 403);
        }
        else {
            next();
        }
    },

    /**
     * Throws error when startkey parameter is missing
     */
    hasStartKey: function(req, res, next) {
        if (!req.query.startkey) {
            res.json({error: 'Invalid request'});
        }
        else {
            next();
        }
    },

    /**
     * Throws error when logged in user can't modify the comment in
     * question.
     */
    canModify: function(req, res, next) {
        var r = new Request(req);
        r.canModify(req.params.commentId, function(ok) {
            if (!ok) {
                res.json({ success: false, reason: 'Forbidden' }, 403);
            }
            else {
                next();
            }
        });
    },

    /**
     * Throws error when logged in user isn't moderator.
     */
    isModerator: function(req, res, next) {
        if (new Request(req).isModerator()) {
            next();
        }
        else {
            res.json({ success: false, reason: 'Forbidden' }, 403);
        }
    },

    /**
     * Throws error when logged in user can't vote on the comment in
     * question.
     */
    canVote: function(req, res, next) {
        var r = new Request(req);
        r.getComment(req.params.commentId, function(comment) {
            if (r.getUserId() === comment.user_id) {
                res.json({success: false, reason: 'You cannot vote on your own content'});
            }
            else {
                next();
            }
        });
    },

    /**
     * Attempts to log in the user, throws error on failure.
     */
    attemptLogin: function(req, res, next) {
        new Request(req).login(req.body.username, req.body.password, function(err, user) {
            if (err) {
                res.json({ success: false, reason: err });
                return;
            }

            req.session = req.session || {};
            req.session.user = user;

            next();
        }.bind(this));
    },

    /**
     * Performs the logout.
     */
    doLogout: function(req, res, next) {
        req.session.user = null;
        next();
    }

};

module.exports = Auth;
