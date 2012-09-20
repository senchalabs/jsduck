var TableFactory = require("./table_factory");
var ApiAdapter = require("./api_adapter");
var Mailer = require("./mailer");

/**
 * Handles JSON API request.
 *
 * @constructor
 * Initializes with current HTTP request object.
 * @param {Object} req The request object from Express.
 */
function Request(req) {
    this.req = req;
    if (req.params.sdk && +req.params.version) {
        this.domain = req.params.sdk+"-"+req.params.version;
    }
    this.db = new TableFactory(this.domain);
}

Request.prototype = {
    /**
     * Performs the login.
     */
    login: function(user, pass, callback) {
        this.db.users().login(user, pass, callback);
    },

    /**
     * Does the recent comments query.
     */
    getRecentComments: function(query, callback) {
        if (query.hideCurrentUser) {
            query.hideUser = this.getUserId();
        }

        this.setCommentsTableOptions();

        this.db.comments().findRecent(query, function(err, comments) {
            this.db.comments().count(query, function(err, total) {
                var commentsOut = comments.map(ApiAdapter.commentToJson, ApiAdapter);

                // store total count to last comment.
                // It's a hack, but that's what we're left with for now.
                var last = commentsOut[commentsOut.length-1];
                if (last) {
                    last.total_rows = total;
                    last.offset = query.offset;
                    last.limit = query.limit;
                }

                callback(commentsOut);
            });
        }.bind(this));
    },

    /**
     * Retrieves most upvoted users.
     */
    getTopUsers: function(sortBy, callback) {
        this.db.comments().getTopUsers(sortBy, function(err, users) {
            callback(users.map(ApiAdapter.userToJson, ApiAdapter));
        });
    },

    /**
     * Retrieves most commented targets.
     */
    getTopTargets: function(callback) {
        this.db.comments().getTopTargets(function(err, targets) {
            callback(targets);
        });
    },

    /**
     * Provides the comments_meta request data.
     */
    getCommentCountsPerTarget: function(callback) {
        this.db.comments().countsPerTarget(function(err, counts) {
            callback(counts);
        });
    },

    /**
     * Retrieves comments for a particular target.
     */
    getComments: function(target, callback) {
        var targetObj = ApiAdapter.targetFromJson(JSON.parse(target));

        this.setCommentsTableOptions();

        this.db.comments().find(targetObj, function(err, comments) {
            callback(comments.map(ApiAdapter.commentToJson, ApiAdapter));
        });
    },

    setCommentsTableOptions: function() {
        if (this.isLoggedIn()) {
            this.db.comments().showVoteDirBy(this.getUserId());
            if (this.isModerator()) {
                this.db.comments().showReadBy(this.getUserId());
            }
        }
    },

    /**
     * Gets one comment by ID.
     */
    getComment: function(comment_id, callback) {
        this.db.comments().getById(comment_id, function(err, comment) {
            callback(ApiAdapter.commentToJson(comment));
        });
    },

    /**
     * Adds new comment.
     */
    addComment: function(target, content, threadUrl, callback) {
        var comment = {
            user_id: this.getUserId(),
            target: ApiAdapter.targetFromJson(JSON.parse(target)),
            content: content
        };

        this.db.comments().add(comment, function(err, comment_id) {
            if (this.isModerator()) {
                this.markRead(comment_id, function() {
                    callback(comment_id);
                });
            }
            else {
                callback(comment_id);
            }

            this.sendEmailUpdates(comment_id, threadUrl);
        }.bind(this));
    },

    sendEmailUpdates: function(comment_id, threadUrl) {
        this.db.comments().getById(comment_id, function(err, comment) {
            var mailer = new Mailer({
                db: this.db,
                comment: comment,
                threadUrl: threadUrl
            });
            mailer.sendEmailUpdates();
        }.bind(this));
    },

    /**
     * Deletes or undeletes a comment.
     */
    setDeleted: function(comment_id, deleted, callback) {
        if (deleted === false) {
            this.db.comments().showDeleted(true);
        }

        var action = {
            id: comment_id,
            user_id: this.getUserId(),
            deleted: deleted
        };
        this.db.comments().setDeleted(action, function(err) {
            callback();
        });
    },

    /**
     * Updates contents of a comment.
     */
    updateComment: function(comment_id, content, callback) {
        var update = {
            id: comment_id,
            user_id: this.getUserId(),
            content: content
        };

        this.db.comments().update(update, function(err) {
            this.db.comments().getById(comment_id, function(err, comment) {
                callback(ApiAdapter.commentToJson(comment));
            });
        }.bind(this));
    },

    /**
     * Votes comment up or down.
     */
    vote: function(comment_id, vote, callback) {
        var voteObj = {
            user_id: this.getUserId(),
            comment_id: comment_id,
            value: vote === "up" ? 1 : -1
        };

        this.db.comments().vote(voteObj, function(err, voteDir, total) {
            var direction = voteDir === 1 ? "up" : (voteDir === -1 ? "down" : null);
            callback(direction, total);
        });
    },

    /**
     * Marks comment as read.
     */
    markRead: function(comment_id, callback) {
        var read = {
            user_id: this.getUserId(),
            comment_id: comment_id
        };

        this.db.comments().markRead(read, function(err) {
            callback();
        });
    },

    /**
     * Returns all subscriptions for current user.
     */
    getSubscriptions: function(callback) {
        if (!this.isLoggedIn()) {
            callback([]);
            return;
        }

        this.db.subscriptions().findTargetsByUser(this.getUserId(), function(err, targets) {
            callback(targets.map(ApiAdapter.targetToJson, ApiAdapter));
        });
    },

    /**
     * Subscribes or unsubscribes a user.
     */
    changeSubscription: function(target, subscribe, callback) {
        var sub = {
            user_id: this.getUserId(),
            target: ApiAdapter.targetFromJson(JSON.parse(target))
        };

        if (subscribe) {
            this.db.subscriptions().add(sub, callback);
        }
        else {
            this.db.subscriptions().remove(sub, callback);
        }
    },

    /**
     * Retrieves the currently logged in user.
     */
    getUser: function(callback) {
        callback(this.req.session && this.req.session.user);
    },

    /**
     * Returns ID of logged in user.
     * @return {Number}
     */
    getUserId: function() {
        return this.req.session.user.id;
    },

    /**
     * True when user is logged in
     * @return {Boolean}
     */
    isLoggedIn: function() {
        return this.req.session && this.req.session.user;
    },

    /**
     * Returns true when logged in user is moderator.
     * @return {Boolean}
     * @private
     */
    isModerator: function() {
        return this.req.session.user.moderator;
    },

    /**
     * True when logged in user can modify comment with given ID.
     * Works also for deleted comments.
     * @param {Number} comment_id
     * @param {Function} callback
     * @param {Function} callback.success True when user can modify the comment.
     */
    canModify: function(comment_id, callback) {
        this.db.comments().showDeleted(true);
        this.db.comments().getById(comment_id, function(err, comment) {
            this.db.comments().showDeleted(false);
            var user = this.req.session.user;
            callback(user.moderator || user.id == comment.user_id);
        }.bind(this));
    }
};

module.exports = Request;
