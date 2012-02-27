
var marked = require('marked'),
    _ = require('underscore'),
    sanitizer = require('sanitizer'),
    nodemailer = require("nodemailer");

exports.sanitize = function(content, opts) {

    var markdowned, sanitized_output, urlFunc;

    try {
        markdowned = marked(content);
    } catch(e) {
        markdowned = content;
    }

    var exp = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/igm;
    markdowned = markdowned.replace(exp, "<a href='$1'>$1</a>");

    if (opts && opts.stripUrls) {
        urlFunc = function(str) {
            if (str.match(/^(http:\/\/(www\.)?sencha.com|#))/)) {
                return str;
            } else {
                return '';
            }
        };
    }

    sanitized_output = sanitizer.sanitize(markdowned, urlFunc);
    sanitized_output = sanitized_output.replace(/&apos;/g, '&#39;');

    return sanitized_output;
};

exports.formatComments = function(comments, req) {

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

exports.vote = function(req, res, comment) {

    var voteDirection;

    if (req.session.user.username == comment.author) {

        // Ignore votes from the author
        res.json({success: false, reason: 'You cannot vote on your own content'});
        return;

    } else if (req.body.vote == 'up' && !_.include(comment.upVotes, req.session.user.username)) {

        var voted = _.include(comment.downVotes, req.session.user.username);

        comment.downVotes = _.reject(comment.downVotes, function(v) {
            return v == req.session.user.username;
        });

        if (!voted) {
            voteDirection = 'up';
            comment.upVotes.push(req.session.user.username);
        }
    } else if (req.body.vote == 'down' && !_.include(comment.downVotes, req.session.user.username)) {

        var voted = _.include(comment.upVotes, req.session.user.username);

        comment.upVotes = _.reject(comment.upVotes, function(v) {
            return v == req.session.user.username;
        });

        if (!voted) {
            voteDirection = 'down';
            comment.downVotes.push(req.session.user.username);
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


exports.requireLoggedInUser = function(req, res, next) {

    if (!req.session || !req.session.user) {
        res.json({success: false, reason: 'Forbidden'}, 403);
    } else {
        next();
    }
};

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

exports.sendEmailUpdates = function(comment) {

    var mailTransport = nodemailer.createTransport("SMTP",{
        service: "sendmail"
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
    }

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
                from: "Sencha Documentation <test@domine.co.uk>",
                to: subscription.email,
                subject: "Comment on '" + comment.title + "'",
                text: [
                    "A comment on '" + comment.title + "' was posted on the Sencha Documentation:\n",
                    comment.content + "\n",
                    "--",
                    "Original thread: http://docs.sencha.com/" + comment.sdk + "/" + comment.version.replace(/\./, '-') + "/" + comment.url,
                    "Unsubscribe from this thread: http://docs.sencha.com/auth/unsubscribe/" + subscription._id,
                    "Unsubscribe from all threads: http://docs.sencha.com/auth/unsubscribe/" + subscription._id + '?all=true'
                ].join("\n")
            }

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
}


exports.getCommentsMeta = function(req, res, next) {

    var map = function() {
        if (this.target) {
            emit(this.target.slice(0,3).join('__'), 1);
        } else {
            return;
        }
    }

    var reduce = function(key, values) {
        var i = 0, total = 0;

        for (; i< values.length; i++) {
            total += values[i];
        }

        return total;
    }

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
                req.commentsMeta = comments;
                next()
            });
        });
    });
}

exports.getCommentSubscriptions = function(req, res, next) {
    if (req.session.user) {
        Subscription.find({
            sdk: req.params.sdk,
            version: req.params.version,
            userId: req.session.user.userid
        }, function(err, subscriptions) {
            req.commentSubscriptions = _.map(subscriptions, function(subscription) {
                return subscription.target;
            });
            next();
        })
    } else {
        next();
    }
}


