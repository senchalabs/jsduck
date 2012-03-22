
var marked = require('marked'),
    _ = require('underscore'),
    sanitizer = require('sanitizer'),
    nodemailer = require("nodemailer");

/**
 * Converts Markdown-formatted comment text into HTML.
 *
 * @param {String} content Markdown-formatted text
 * @return {String} HTML
 */
exports.markdown = function(content) {
    var markdowned;
    try {
        markdowned = marked(content);
    } catch(e) {
        markdowned = content;
    }

    // Strip dangerous markup, but allow links to all URL-s
    var sanitized_output = sanitizer.sanitize(markdowned, function(str) {
        return str;
    });

    // IE does not support &apos;
    return sanitized_output.replace(/&apos;/g, '&#39;');
};

/**
 * Calculates up/down scores for each comment.
 *
 * Marks if the current user has already voted on the comment.
 * Ensures createdAt timestamp is a string.
 *
 * @param {Object[]} comments
 * @param {Object} req Containing username data
 * @return {Object[]}
 */
exports.scoreComments = function(comments, req) {
    return _.map(comments, function(comment) {
        comment = _.extend(comment._doc, {
            score: comment.upVotes.length - comment.downVotes.length,
            createdAt: String(comment.createdAt)
        });

        if (req.session.user) {
            comment.upVote = _.contains(comment.upVotes, req.session.user.username);
            comment.downVote = _.contains(comment.downVotes, req.session.user.username);
        }

        return comment;
    });
};

/**
 * Performs voting on comment.
 *
 * @param {Object} req The request object.
 * @param {Object} res The response object where voting result is written.
 * @param {Comment} comment The comment to vote on.
 */
exports.vote = function(req, res, comment) {
    var voteDirection;
    var username = req.session.user.username;

    if (username == comment.author) {

        // Ignore votes from the author
        res.json({success: false, reason: 'You cannot vote on your own content'});
        return;

    } else if (req.body.vote == 'up' && !_.include(comment.upVotes, username)) {

        var voted = _.include(comment.downVotes, username);

        comment.downVotes = _.reject(comment.downVotes, function(v) {
            return v == username;
        });

        if (!voted) {
            voteDirection = 'up';
            comment.upVotes.push(username);
        }
    } else if (req.body.vote == 'down' && !_.include(comment.downVotes, username)) {

        var voted = _.include(comment.upVotes, username);

        comment.upVotes = _.reject(comment.upVotes, function(v) {
            return v == username;
        });

        if (!voted) {
            voteDirection = 'down';
            comment.downVotes.push(username);
        }
    }

    comment.save(function(err, response) {
        res.json({
            success: true,
            direction: voteDirection,
            total: (comment.upVotes.length - comment.downVotes.length)
        });
    });
};

/**
 * Ensures that user is logged in.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.requireLoggedInUser = function(req, res, next) {
    if (!req.session || !req.session.user) {
        res.json({success: false, reason: 'Forbidden'}, 403);
    } else {
        next();
    }
};

/**
 * Looks up comment by ID.
 *
 * Stores it into `req.comment`.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.findComment = function(req, res, next) {
    if (req.params.commentId) {
        Comment.findById(req.params.commentId, function(err, comment) {
            req.comment = comment;
            next();
        });
    } else {
        res.json({success: false, reason: 'No such comment'});
    }
};

/**
 * Looks up comment meta by comment ID.
 *
 * Stores it into `req.commentMeta`.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.findCommentMeta = function(req, res, next) {
    if (req.params.commentId) {

        var userCommentMeta = {
            userId: req.session.user.userid,
            commentId: req.params.commentId
        };

        Meta.findOne(userCommentMeta, function(err, commentMeta) {
            req.commentMeta = commentMeta || new Meta(userCommentMeta);
            next();
        });
    } else {
        res.json({success: false, reason: 'No such comment'});
    }
};

/**
 * Ensures that user is allowed to modify/delete the comment,
 * that is, he is the owner of the comment or a moderator.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.requireOwner = function(req, res, next) {
    var isModerator = _.include(req.session.user.membergroupids, 7);
    var isAuthor = req.session.user.username == req.comment.author;

    if (isModerator || isAuthor) {
        next();
    }
    else {
        res.json({ success: false, reason: 'Forbidden' }, 403);
    }
};

/**
 * Sends e-mail updates when comment is posted to a thread that has
 * subscribers.
 *
 * @param {Comment} comment
 */
exports.sendEmailUpdates = function(comment) {
    var mailTransport = nodemailer.createTransport("SMTP",{
        host: 'localhost',
        port: 25
    });

    var sendSubscriptionEmail = function(emails) {
        var email = emails.shift();

        if (email) {
            nodemailer.sendMail(email, function(err){
                if (err){
                    console.log(err);
                } else{
                    console.log("Sent email to " + email.to);
                    sendSubscriptionEmail(emails);
                }
            });
        } else {
             console.log("Finished sending emails");
             mailTransport.close();
        }
    };

    var subscriptionBody = {
        sdk: comment.sdk,
        version: comment.version,
        target: comment.target
    };

    var emails = [];

    Subscription.find(subscriptionBody, function(err, subscriptions) {
        _.each(subscriptions, function(subscription) {
            var mailOptions = {
                transport: mailTransport,
                from: "Sencha Documentation <no-reply@sencha.com>",
                to: subscription.email,
                subject: "Comment on '" + comment.title + "'",
                text: [
                    "A comment by " + comment.author + " on '" + comment.title + "' was posted on the Sencha Documentation:\n",
                    comment.content + "\n",
                    "--",
                    "Original thread: " + comment.url,
                    "Unsubscribe from this thread: http://projects.sencha.com/auth/unsubscribe/" + subscription._id,
                    "Unsubscribe from all threads: http://projects.sencha.com/auth/unsubscribe/" + subscription._id + '?all=true'
                ].join("\n")
            };

            if (Number(comment.userId) != Number(subscription.userId)) {
                emails.push(mailOptions);
            }
        });

        if (emails.length) {
            sendSubscriptionEmail(emails);
        } else {
            console.log("No emails to send");
        }
    });
};

/**
 * Retrieves comment counts for each target.
 *
 * Stores into `req.commentCounts` field an array like this:
 *
 *     [
 *         {"_id": "class__Ext__", "value": 3},
 *         {"_id": "class__Ext__method-define", "value": 1},
 *         {"_id": "class__Ext.Panel__cfg-title", "value": 8}
 *     ]
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.getCommentCounts = function(req, res, next) {
    // Map each comment into: ("type__Class__member", 1)
    var map = function() {
        if (this.target) {
            emit(this.target.slice(0,3).join('__'), 1);
        } else {
            return;
        }
    };

    // Sum comment counts for each target
    var reduce = function(key, values) {
        var total = 0;

        for (var i = 0; i < values.length; i++) {
            total += values[i];
        }

        return total;
    };

    mongoose.connection.db.executeDbCommand({
        mapreduce: 'comments',
        map: map.toString(),
        reduce: reduce.toString(),
        out: 'commentCounts',
        query: {
            deleted: { '$ne': true },
            sdk: req.params.sdk,
            version: req.params.version
        }
    }, function(err, dbres) {
        mongoose.connection.db.collection('commentCounts', function(err, collection) {
            collection.find({}).toArray(function(err, comments) {
                req.commentCounts = comments;
                next();
            });
        });
    });
};

/**
 * Retrieves list of commenting targets into which the current user
 * has subscribed for e-mail updates.
 *
 * Stores them into `req.commentMeta.subscriptions` field as array:
 *
 *     [
 *         ["class", "Ext", ""],
 *         ["class", "Ext", "method-define"],
 *         ["class", "Ext.Panel", "cfg-title"]
 *     ]
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.getCommentSubscriptions = function(req, res, next) {

    req.commentMeta = req.commentMeta || {};

    if (req.session.user) {
        Subscription.find({
            sdk: req.params.sdk,
            version: req.params.version,
            userId: req.session.user.userid
        }, function(err, subscriptions) {
            req.commentMeta.subscriptions = _.map(subscriptions, function(subscription) {
                return subscription.target;
            });
            next();
        });
    } else {
        next();
    }
};

/**
 * Retrieves list of comments marked 'read' by the current user.
 *
 * Stores them into `req.commentMeta.reads` field as array:
 *
 *     [
 *         'abc123',
 *         'abc456',
 *         'abc789'
 *     ]
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.getCommentReads = function(req, res, next) {

    req.commentMeta = req.commentMeta || {};

    if (req.session.user) {
        Meta.find({
            userId: req.session.user.userid
        }, function(err, commentMeta) {
            req.commentMeta.reads = _.map(commentMeta, function(commentMeta) {
                return commentMeta.commentId;
            });
            next();
        });
    } else {
        next();
    }
};


