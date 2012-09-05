var Targets = require("./targets");
var Formatter = require("./formatter");

/**
 * Represents a Comments table.
 *
 * @constructor
 * Initializes Comments with a database connection and a target domain.
 *
 * @param {DbFacade} db Instance of DbFacade.
 *
 * @param {String} domain The comments domain within which to work.
 * For example by passing "touch-2" the #find method will only find
 * comments within touch-2 domain.
 */
function Comments(db, domain) {
    this.db = db;
    this.domain = domain;
    this.targets = new Targets(db, domain);
    this.view = "full_visible_comments AS comments";
    this.fields = ["*"];
}

Comments.prototype = {
    /**
     * Toggles between showing and hiding deleted comments.  By
     * default all the #get* #find* and #count* methods will exclude
     * the deleted comments.  But by first calling showDeleted(true)
     * the deleted comments will also be included.
     * @param {Boolean} show
     */
    showDeleted: function(show) {
        this.view = show ? "full_comments AS comments" : "full_visible_comments as comments";
    },

    /**
     * Includes a `vote_dir` field into the comment records returned
     * by #get* and #find* methods.  The `vote_dir` field will be 1
     * when the user has upvoted the comment, -1 if he has downvoted
     * it or null if he has not voted on the comment.
     * @param {Number} user_id The ID of the user who's votes to inspect.
     */
    showVoteDirBy: function(user_id) {
        var sql = "(SELECT SUM(value) FROM votes WHERE user_id = ? AND comment_id = comments.id) AS vote_dir";
        this.fields.push(this.db.format(sql, [user_id]));
    },

    /**
     * Includes a `read` field into the comment records returned
     * by #get* and #find* methods.  The `read` field will be 1
     * when the user has read the comment, 0 if he hasn't.
     * @param {Number} user_id The ID of the user who's readings to inspect.
     */
    showReadBy: function(user_id) {
        var sql = "(SELECT COUNT(*) FROM readings WHERE user_id = ? AND comment_id = comments.id) AS `read`";
        this.fields.push(this.db.format(sql, [user_id]));
    },

    /**
     * Finds a single comment by ID in the current domain.
     *
     * @param {Number} id The ID of the comment to find.
     * @param {Function} callback Called with the result.
     * @param {Error} callback.err The error object.
     * @param {Object} callback.comment The comment found or undefined.
     */
    getById: function(id, callback) {
        var sql = [
            'SELECT ', this.fields.join(", "),
            'FROM', this.view,
            'WHERE domain = ? AND id = ?'
        ];

        this.db.query(sql, [this.domain, id], this.fixFields(function(err, rows) {
            callback(err, rows && rows[0]);
        }));
    },

    /**
     * Finds list of all comments for a particular target.
     *
     * @param {Object} target The target:
     * @param {String} target.type One of: class, guide, video.
     * @param {String} target.cls The name of the class, guide or video.
     * @param {String} target.member The name of class member or empty string.
     *
     * @param {Function} callback Called with the result.
     * @param {Error} callback.err The error object.
     * @param {Object[]} callback.comments An array of comment rows.
     */
    find: function(target, callback) {
        var sql = [
            'SELECT ', this.fields.join(", "),
            'FROM', this.view,
            'WHERE domain = ? AND type = ? AND cls = ? AND member = ?',
            'ORDER BY created_at'
        ];

        this.db.query(sql, [this.domain, target.type, target.cls, target.member], this.fixFields(callback));
    },

    /**
     * Returns all comments sorted in reverse chronological order.
     *
     * @param {Object} opts Options for the query:
     * @param {Number} [opts.limit=100] Number of rows to return.
     * @param {Number} [opts.offset=0] The starting index.
     * @param {Number} [opts.orderBy="created_at"] By which column to sort the results.
     * Two possible options here: "created_at" and "vote".
     *
     * @param {Function} callback Called with the result.
     * @param {Error} callback.err The error object.
     * @param {Object[]} callback.comments An array of comment rows.
     */
    findRecent: function(opts, callback) {
        opts.orderBy = opts.orderBy || "created_at";

        var sql = [
            'SELECT ', this.fields.join(", "),
            'FROM', this.view,
            'WHERE domain = ?',
            'ORDER BY '+opts.orderBy+' DESC',
            'LIMIT ? OFFSET ?'
        ];

        this.db.query(sql, [this.domain, opts.limit||100, opts.offset||0], this.fixFields(callback));
    },

    /**
     * Counts number of comments in the current domain.
     *
     * @param {Object} opts Reserved for future.
     *
     * @param {Function} callback Called with the result.
     * @param {Error} callback.err The error object.
     * @param {Number} callback.count The number of comments found.
     */
    count: function(opts, callback) {
        var sql = [
            'SELECT COUNT(*) as count',
            'FROM', this.view,
            'WHERE domain = ?'
        ];

        this.db.queryOne(sql, [this.domain], function(err, row) {
            callback(err, +row.count);
        });
    },

    /**
     * Returns number of comments for each target in the current
     * domain.
     *
     * @param {Function} callback Called with the result.
     * @param {Error} callback.err The error object.
     * @param {Object[]} callback.counts Array of counts per target:
     *
     *     [
     *         {_id: "class__Ext__": value: 3},
     *         {_id: "class__Ext__method-define": value: 1},
     *         {_id: "class__Ext.Panel__cfg-title": value: 8}
     *     ]
     */
    countsPerTarget: function(callback) {
        var sql = [
            'SELECT',
            "    CONCAT(type, '__', cls, '__', member) AS _id,",
            "    count(*) AS value",
            'FROM', this.view,
            'WHERE domain = ?',
            'GROUP BY target_id'
        ];

        this.db.query(sql, [this.domain], function(err, rows) {
            // convert values to numbers
            rows.forEach(function(r) { r.value = +r.value; });
            callback(err, rows);
        });
    },

    /**
     * Adds new comment for a target.
     * If the target doesn't yet exist, creates it first.
     *
     * @param {Object} comment A comment object with fields:
     * @param {Number} comment.user_id ID of logged-in user.
     * @param {String} comment.content The text of comment.
     * @param {Object} comment.target The target:
     * @param {String} comment.target.type   Type name of target.
     * @param {String} comment.target.cls    Class name of target.
     * @param {String} comment.target.member Member name of target.
     * @param {Function} callback
     * @param {Error} callback.err The error object.
     * @param {Function} callback.id The ID of newly inserted comment.
     */
    add: function(comment, callback) {
        this.targets.ensure(comment.target, function(err, target_id) {
            if (err) {
                callback(err);
                return;
            }
            this.db.insert('comments', {
                target_id: target_id,
                user_id: comment.user_id,
                content: comment.content,
                content_html: Formatter.format(comment.content),
                created_at: new Date()
            }, callback);
        }.bind(this));
    },

    /**
     * Updates existing comment.
     *
     * @param {Object} comment A comment object with fields:
     * @param {Number} comment.id ID of the comment to update.
     * @param {Number} comment.user_id ID of the user doing the update.
     * @param {String} comment.content New text for the comment.
     * @param {Error} callback.err The error object.
     * @param {Function} callback Called when done.
     */
    update: function(comment, callback) {
        var data = {
            id: comment.id,
            content: comment.content,
            content_html: Formatter.format(comment.content)
        };
        this.db.update("comments", data, function(err) {
            if (err) {
                callback(err);
                return;
            }
            this.db.insert("updates", {
                comment_id: comment.id,
                user_id: comment.user_id,
                action: 'update',
                created_at: new Date()
            }, callback);
        }.bind(this));
    },

    /**
     * Marks comment as deleted or not deleted.
     *
     * @param {Object} action An action config:
     * @param {Number} action.id ID of the comment.
     * @param {Number} action.user_id ID of the user doing the delete or undelete.
     * @param {Boolean} action.deleted True to delete, false to undo delete.
     * @param {Error} callback.err The error object.
     * @param {Function} callback Called when done.
     */
    setDeleted: function(action, callback) {
        var data = {
            id: action.id,
            deleted: action.deleted ? 1 : 0
        };
        this.db.update("comments", data, function(err) {
            if (err) {
                callback(err);
                return;
            }
            this.db.insert("updates", {
                comment_id: action.id,
                user_id: action.user_id,
                action: action.deleted ? 'delete' : 'undo_delete',
                created_at: new Date()
            }, callback);
        }.bind(this));
    },

    /**
     * Votes a comment up or down.
     *
     * @param {Object} vote
     * @param {Number} vote.user_id The user who's voting
     * @param {Number} vote.comment_id The comment he's voting on
     * @param {Number} vote.value The value of the vote (1 or -1)
     * @param {Function} callback
     * @param {Error} callback.err
     * @param {Number} callback.resultingVote The vote that was actually casted (-1, 1 or 0)
     * @param {Number} callback.resultingTotal The final voting score for the comment.
     */
    vote: function(vote, callback) {
        this.castVote(vote, function(err, voteDir) {
            if (err) {
                callback(err);
                return;
            }

            var sql = "SELECT vote FROM comments WHERE id = ?";
            this.db.queryOne(sql, [vote.comment_id], function(err, comment) {
                callback(err, voteDir, comment && comment.vote);
            });
        }.bind(this));
    },

    castVote: function(vote, callback) {
        vote.created_at = new Date();
        this.db.insert("votes", vote, function(err, vote_id) {
            if (err) {
                // vote already exists, retrieve it
                var sql = "SELECT * FROM votes WHERE user_id = ? AND comment_id = ?";
                this.db.queryOne(sql, [vote.user_id, vote.comment_id], function(err, oldVote) {
                    if (err) {
                        callback(err);
                    }
                    else if (oldVote.value !== vote.value) {
                        // We're either upvoting a downvote or downvoting an upvote.
                        // In both cases the result is zero, so we remove the vote completely.
                        var sql = "DELETE FROM votes WHERE user_id = ? AND comment_id = ?";
                        this.db.query(sql, [vote.user_id, vote.comment_id], function(err) {
                            callback(err, 0);
                        });
                    }
                    else {
                        // can't upvote or downvote twice, so ignore and do nothing
                        callback(null, 0);
                    }
                }.bind(this));
            }
            else {
                callback(null, vote.value);
            }
        }.bind(this));
    },

    /**
     * Marks comment as read.
     *
     * @param {Object} read
     * @param {Number} read.user_id The user who's marking it.
     * @param {Number} read.comment_id The comment he's marking.
     * @param {Function} callback
     * @param {Error} callback.err
     */
    markRead: function(read, callback) {
        read.created_at = new Date();
        this.db.insert("readings", read, function(err) {
            if (err && err.code === "ER_DUP_ENTRY") {
                callback();
            }
            else {
                callback(err);
            }
        });
    },

    // Helper that converts all `vote_dir` and `read` fields into
    // appropriate type. For some reason the vote_dir field is a
    // string by default, but we don't want that.  The `read` field is
    // a string, but we really want a boolean instead.
    fixFields: function(callback) {
        return function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, rows.map(function(r) {
                if (r.vote_dir) {
                    r.vote_dir = +r.vote_dir;
                }
                if (r.read) {
                    r.read = !!(+r.read);
                }
                return r;
            }));
        };
    }
};

module.exports = Comments;
