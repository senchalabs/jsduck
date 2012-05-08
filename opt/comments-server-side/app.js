
/**
 * JSDuck authentication / commenting server side element. Requires Node.js + MongoDB.
 *
 * Authentication assumes a vBulletin forum database, but could easily be adapted (see ForumUser.js)
 *
 * Expects a config file, config.js, that looks like this:
 *
 *     exports.db = {
 *         user: 'forumUsername',
 *         password: 'forumPassword',
 *         host: 'forumHost',
 *         dbName: 'forumDb'
 *     };
 *
 *     exports.sessionSecret = 'random string for session cookie encryption';
 *
 *     exports.mongoDb = 'mongodb://mongoHost:port/comments';
 *
 */

var config = require('./config');
require('./database');

var mysql = require('mysql'),
    client = mysql.createClient({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.dbName
    }),
    express = require('express'),
    MongoStore = require('connect-mongo'),
    _ = require('underscore'),
    ForumUser = require('./ForumUser').ForumUser,
    forumUser = new ForumUser(client),
    util = require('./util'),
    crypto = require('crypto'),
    mongoose = require('mongoose');

var app = express();

app.configure(function() {

    // Headers for Cross Origin Resource Sharing (CORS)
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    });

    app.use(express.cookieParser(config.sessionSecret));

    // Hack to set session cookie if session ID is set as a URL param.
    // This is because not all browsers support sending cookies via CORS
    app.use(function(req, res, next) {
        if (req.query.sid && req.query.sid != 'null') {
            var sid = req.query.sid.replace(/ /g, '+');
            req.sessionID = sid;
            req.signedCookies = req.signedCookies || {};
            req.signedCookies['sencha_docs'] = sid;
        }
        next();
    });

    // Use MongoDB for session storage
    app.use(express.session({
        secret: config.sessionSecret,
        key: 'sencha_docs',
        store: new MongoStore({
            url: exports.mongoDb + "/sessions"
        })
    }));

    app.use(function(req, res, next) {
        // IE doesn't get content-type, so default to form encoded.
        if (!req.headers['content-type']) {
            req.headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        next();
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.enable('jsonp callback');
});

app.configure('development', function(){
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
});

/**
 * Authentication
 */

app.get('/auth/session', function(req, res) {
    var result = req.session && req.session.user && forumUser.clientUser(req.session.user);
    res.json(result || false);
});

app.post('/auth/login', function(req, res){

    forumUser.login(req.body.username, req.body.password, function(err, result) {

        if (err) {
            res.json({ success: false, reason: err });
            return;
        }

        req.session = req.session || {};
        req.session.user = result;

        var response = _.extend(forumUser.clientUser(result), {
            sessionID: req.sessionID,
            success: true
        });

        res.json(response);
    });
});

// Remove session
app.post('/auth/logout', function(req, res){
    req.session.user = null;
    res.json({ success: true });
});

/**
 * Handles comment unsubscription requests.
 */
app.get('/auth/unsubscribe/:subscriptionId', function(req, res) {

    Subscription.findOne({ _id: req.params.subscriptionId }, function(err, subscription) {
        if (err) throw(err);

        if (subscription) {
            if (req.query.all == 'true') {
                Subscription.remove({ userId: subscription.userId }, function(err) {
                    res.send("You have been unsubscribed from all threads.");
                });
            } else {
                Subscription.remove({ _id: req.params.subscriptionId }, function(err) {
                    res.send("You have been unsubscribed from that thread.");
                });
            }
        } else {
            res.send("You are already unsubscribed.");
        }
    });
});


/**
 * Commenting
 */

/**
 * Returns a list of comments for a particular target (eg class, guide, video)
 */
app.get('/auth/:sdk/:version/comments', util.getCommentReads, function(req, res) {

    if (!req.query.startkey) {
        res.json({error: 'Invalid request'});
        return;
    }

    Comment.find({
        target: JSON.parse(req.query.startkey),
        deleted: { '$ne': true },
        sdk: req.params.sdk,
        version: req.params.version
    }).sort('createdAt', 1).run(function(err, comments){
        res.json(util.scoreComments(comments, req));
    });
});

/**
 * Returns n most recent comments.
 * Takes two parameters: offset and limit.
 *
 * The last comment object returned will contain `total_rows`,
 * `offset` and `limit` fields. I'd say it's a hack, but at least
 * it works for now.
 */
app.get('/auth/:sdk/:version/comments_recent', util.getCommentReads, function(req, res) {
    var offset = parseInt(req.query.offset, 10) || 0;
    var limit = parseInt(req.query.limit, 10) || 100;
    var filter = {
        deleted: { '$ne': true },
        sdk: req.params.sdk,
        version: req.params.version
    };

    if (req.query.hideRead && req.commentMeta.reads.length > 0) {
        filter._id = { $nin: req.commentMeta.reads };
    }

    Comment.find(filter).sort('createdAt', -1).skip(offset).limit(limit).run(function(err, comments) {
        comments = util.scoreComments(comments, req);
        // Count all comments, store count to last comment
        Comment.count(filter).run(function(err, count) {
            var last = comments[comments.length-1];
            last.total_rows = count;
            last.offset = offset;
            last.limit = limit;
            res.json(comments);
        });
    });
});

/**
 * Returns number of comments for each class/member,
 * and a list of classes/members into which the user has subscribed.
 */
app.get('/auth/:sdk/:version/comments_meta', util.getCommentCounts, util.getCommentSubscriptions, function(req, res) {
    res.send({ comments: req.commentCounts, subscriptions: req.commentSubscriptions || [] });
});

/**
 * Returns an individual comment (used when editing a comment)
 */
app.get('/auth/:sdk/:version/comments/:commentId', util.findComment, function(req, res) {
    res.json({ success: true, content: req.comment.content });
});

/**
 * Creates a new comment
 */
app.post('/auth/:sdk/:version/comments', util.requireLoggedInUser, function(req, res) {

    var target = JSON.parse(req.body.target);

    if (target.length === 2) {
        target.push('');
    }

    var comment = new Comment({
        author: req.session.user.username,
        userId: req.session.user.userid,
        content: req.body.comment,
        action: req.body.action,
        rating: Number(req.body.rating),
        contentHtml: util.markdown(req.body.comment),
        downVotes: [],
        upVotes: [],
        createdAt: new Date,
        target: target,
        emailHash: crypto.createHash('md5').update(req.session.user.email).digest("hex"),
        sdk: req.params.sdk,
        version: req.params.version,
        moderator: req.session.user.moderator,
        title: req.body.title,
        url: req.body.url
    });

    var afterSave = function() {
        res.json({ success: true, id: comment._id, action: req.body.action });

        util.sendEmailUpdates(comment);
    };

    comment.save(function(err) {
        if (util.isModerator(req.session.user)) {
            // When moderator posts comment, mark it automatically as read.
            var meta = new Meta({
                userId: req.session.user.userid,
                commentId: comment._id,
                metaType: 'read'
            });
            meta.save(afterSave);
        }
        else {
            afterSave();
        }
    });

});

/**
 * Updates an existing comment (for voting or updating contents)
 */
app.post('/auth/:sdk/:version/comments/:commentId', util.requireLoggedInUser, util.findComment, function(req, res) {

    var voteDirection,
        comment = req.comment;

    if (req.body.vote) {
        util.vote(req, res, comment);
    } else {
        util.requireOwner(req, res, function() {
            comment.content = req.body.content;
            comment.contentHtml = util.markdown(req.body.content);

            comment.updates = comment.updates || [];
            comment.updates.push({
                updatedAt: String(new Date()),
                author: req.session.user.username
            });

            comment.save(function(err) {
                res.json({ success: true, content: comment.contentHtml });
            });
        });
    }
});

/**
 * Deletes a comment
 */
app.post('/auth/:sdk/:version/comments/:commentId/delete', util.requireLoggedInUser, util.findComment, util.requireOwner, function(req, res) {
    req.comment.deleted = true;
    req.comment.save(function(err) {
        res.send({ success: true });
    });
});

/**
 * Restores deleted comment
 */
app.post('/auth/:sdk/:version/comments/:commentId/undo_delete', util.requireLoggedInUser, util.findComment, util.requireOwner, util.getCommentReads, function(req, res) {
    req.comment.deleted = false;
    req.comment.save(function(err) {
        res.send({ success: true, comment: util.scoreComments([req.comment], req)[0] });
    });
});

/**
 * Marks a comment 'read'
 */
app.post('/auth/:sdk/:version/comments/:commentId/read', util.requireLoggedInUser, util.findCommentMeta, function(req, res) {
    req.commentMeta.metaType = 'read';
    req.commentMeta.save(function(err) {
        res.send({ success: true });
    });
});

/**
 * Get email subscriptions
 */
app.get('/auth/:sdk/:version/subscriptions', util.getCommentSubscriptions, function(req, res) {
    res.json({ subscriptions: req.commentMeta.subscriptions });
});

/**
 * Subscibe / unsubscribe to a comment thread
 */
app.post('/auth/:sdk/:version/subscribe', util.requireLoggedInUser, function(req, res) {

    var subscriptionBody = {
        sdk: req.params.sdk,
        version: req.params.version,
        target: JSON.parse(req.body.target),
        userId: req.session.user.userid
    };

    Subscription.findOne(subscriptionBody, function(err, subscription) {

        if (subscription && req.body.subscribed == 'false') {

            subscription.remove(function(err, ok) {
                res.send({ success: true });
            });

        } else if (!subscription && req.body.subscribed == 'true') {

            subscription = new Subscription(subscriptionBody);
            subscription.email = req.session.user.email;

            subscription.save(function(err) {
                res.send({ success: true });
            });
        }
    });
});

var port = 3000;
app.listen(port);
console.log("Server started at port "+port+"...");

