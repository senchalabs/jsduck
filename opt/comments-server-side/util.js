
var marked = require('marked'),
    _ = require('underscore'),
    sanitizer = require('sanitizer');

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

        var comment = _.extend(comment._doc, {
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




