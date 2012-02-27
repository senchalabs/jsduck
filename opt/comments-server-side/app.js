
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

config = require('./config');
mongoose = require('mongoose');
require('./database');
require('express-namespace');

var mysql = require('mysql'),
    client = mysql.createClient({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.dbName
    }),
    express = require('express'),
    connect = require('connect'),
    MongoStore = require('connect-session-mongo'),
    _ = require('underscore'),
    ForumUser = require('./ForumUser').ForumUser,
    forumUser = new ForumUser(client),
    util = require('./util'),
    crypto = require('crypto');


var app = express.createServer(

    // Headers for Cross Origin Resource Sharing (CORS)
    function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    },

    express.cookieParser(),

    // Hack to set session cookie if session ID is set as a URL param.
    // This is because not all browsers support sending cookies via CORS
    function(req, res, next) {
        if (req.query.sid) {
            var sid = req.query.sid.replace(/ /g, '+');
            req.cookies = req.cookies || {};
            req.cookies['sencha_docs'] = sid;
        }
        next();
    },

    // Use MongoDB for session storage
    connect.session({ store: new MongoStore, secret: config.sessionSecret, key: 'sencha_docs' }),

    function(req, res, next) {
        // IE doesn't get content-type, so default to form encoded.
        if (!req.headers['content-type']) {
            req.headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        next();
    },
    express.bodyParser(),
    express.methodOverride()
);

app.enable('jsonp callback');

// All URLs start with /auth
app.namespace('/auth', function(){

    /**
     * Authentication
     */

    app.get('/session', function(req, res) {
        var result = req.session && req.session.user && forumUser.clientUser(req.session.user);
        res.json(result || false);
    });

    app.post('/login', function(req, res){

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
    app.post('/logout', function(req, res){
        req.session.user = null;
        res.json({ success: true });
    });
});


/**
 * Commenting
 */
app.namespace('/auth/:sdk/:version', function(){

    /**
     * Returns a list of comments for a particular target (eg class, guide, video)
     */
    app.get('/comments', function(req, res) {

        Comment.find({
            target: JSON.parse(req.query.startkey),
            deleted: { '$ne': true },
            sdk: req.params.sdk,
            version: req.params.version
        }).sort('createdAt', 1).run(function(err, comments){
            res.json(util.formatComments(comments, req));
        });
    });

    /**
     * Returns 100 most recent comments.
     */
    app.get('/comments_recent', function(req, res) {
        Comment.find({
            deleted: { '$ne': true },
            sdk: req.params.sdk,
            version: req.params.version
        }).sort('createdAt', -1).limit(100).run(function(err, comments){
            res.json(util.formatComments(comments, req));
        });
    });

    /**
     * Returns number of comments for each class / method
     */
    app.get('/comments_meta', function(req, res) {

        var map = function() {
            if (this.target) {
                emit(this.target.slice(0,3).join('__'), 1);
            } else {
                return;
            }
        };

        var reduce = function(key, values) {
            var i = 0, total = 0;

            for (; i< values.length; i++) {
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
                    res.send(comments);
                });
            });
        });
    });

    /**
     * Returns an individual comment (used when editing a comment)
     */
    app.get('/comments/:commentId', util.findComment, function(req, res) {
        res.json({ success: true, content: req.comment.content });
    });

    /**
     * Creates a new comment
     */
    app.post('/comments', util.requireLoggedInUser, function(req, res) {

        var target = JSON.parse(req.body.target);

        if (target.length === 2) {
            target.push('');
        }

        var comment = new Comment({
            author: req.session.user.username,
            content: req.body.comment,
            action: req.body.action,
            rating: Number(req.body.rating),
            contentHtml: util.sanitize(req.body.comment),
            downVotes: [],
            upVotes: [],
            createdAt: new Date,
            target: target,
            emaiHash: crypto.createHash('md5').update(req.session.user.email).digest("hex"),
            sdk: req.params.sdk,
            version: req.params.version
        });

        comment.save(function(err, response) {
            res.json({ success: true, id: response._id, action: req.body.action });
        });
    });

    /**
     * Updates an existing comment (for voting or updating contents)
     */
    app.post('/comments/:commentId', util.requireLoggedInUser, util.findComment, function(req, res) {

        var voteDirection,
            comment = req.comment;

        if (req.body.vote) {
            util.vote(req, res, comment);
        } else {
            var canUpdate = _.include(req.session.user.membergroupids, 7) || req.session.user.username == comment.author;

            if (!canUpdate) {
                res.json({success: false, reason: 'Forbidden'}, 403);
                return;
            }

            comment.content = req.body.content;
            comment.contentHtml = util.sanitize(req.body.content);

            comment.updates = comment.updates || [];
            comment.updates.push({
                updatedAt: String(new Date()),
                author: req.session.user.username
            });

            comment.save(function(err, response) {
                res.json({ success: true, content: comment.contentHtml });
            });
        }
    });

    /**
     * Deletes a comment
     */
    app.post('/comments/:commentId/delete', util.requireLoggedInUser, util.findComment, function(req, res) {

        var canDelete = false,
            comment = req.comment;

        canDelete = _.include(req.session.user.membergroupids, 7) || req.session.user.username == doc.body.author;

        if (!canDelete) {
            res.json({ success: false, reason: 'Forbidden' }, 403);
            return;
        }

        comment.deleted = true;

        comment.save(function(err, response) {
            res.send({ success: true });
        });
    });

});

app.listen(3000);
console.log("Server started...");

