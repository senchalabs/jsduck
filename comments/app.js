var express = require('express');
var MySQLStore = require('connect-mysql-session')(express);
var config = require('./config');
var Request = require('./lib/request');
var Auth = require('./lib/auth');

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
        store: new MySQLStore(
            config.mysql.database,
            config.mysql.user,
            config.mysql.password,
            {logging: false}
        )
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

    app.use(express.logger('dev'));
});

// Authentication

app.get('/auth/session', function(req, res) {
    new Request(req).getUser(function(user) {
        if (user) {
            res.json({
                userName: user.username,
                mod: user.moderator
            });
        }
        else {
            res.json(false);
        }
    });
});

app.post('/auth/login', Auth.attemptLogin, function(req, res) {
    new Request(req).getUser(function(user) {
        res.json({
            userName: user.username,
            mod: user.moderator,
            sessionID: req.sessionID,
            success: true
        });
    });
});

app.post('/auth/logout', Auth.doLogout, function(req, res) {
    res.json({ success: true });
});


// Requests for Comments

// Returns n most recent comments.
app.get('/auth/:sdk/:version/comments_recent', function(req, res) {
    var query = {
        offset: parseInt(req.query.offset, 10),
        limit: parseInt(req.query.limit, 10),
        orderBy: req.query.sortByScore ? "vote" : "created_at",
        hideCurrentUser: req.query.hideCurrentUser,
        hideRead: req.query.hideRead
    };
    new Request(req).getRecentComments(query, function(comments) {
        res.json(comments);
    });
});

// Returns number of comments for each class/member,
// and when user is logged in, all his subscriptions.
app.get('/auth/:sdk/:version/comments_meta', function(req, res) {
    var r = new Request(req);
    r.getCommentCountsPerTarget(function(counts) {
        r.getSubscriptions(function(subs) {
            res.json({ comments: counts, subscriptions: subs });
        });
    });
});

// Returns a list of comments for a particular target (eg class, guide, video)
app.get('/auth/:sdk/:version/comments', Auth.hasStartKey, function(req, res) {
    new Request(req).getComments(req.query.startkey, function(comments) {
        res.json(comments);
    });
});

// Adds new comment
app.post('/auth/:sdk/:version/comments', Auth.isLoggedIn, function(req, res) {
    new Request(req).addComment(req.body.target, req.body.comment, req.body.url, function(comment_id) {
        res.json({ id: comment_id, success: true });
    });
});

// Returns plain markdown content of individual comment (used when editing a comment)
app.get('/auth/:sdk/:version/comments/:commentId', function(req, res) {
    new Request(req).getComment(req.params.commentId, function(comment) {
        res.json({ success: true, content: comment.content });
    });
});

// Updates an existing comment (for voting or updating contents)
app.post('/auth/:sdk/:version/comments/:commentId', Auth.isLoggedIn, function(req, res) {
    if (req.body.vote) {
        Auth.canVote(req, res, function() {
            new Request(req).vote(req.params.commentId, req.body.vote, function(direction, total) {
                res.json({
                    success: true,
                    direction: direction,
                    total: total
                });
            });
        });
    }
    else {
        Auth.canModify(req, res, function() {
            new Request(req).updateComment(req.params.commentId, req.body.content, function(comment) {
                res.json({ success: true, content: comment.contentHtml });
            });
        });
    }
});

// Deletes a comment
app.post('/auth/:sdk/:version/comments/:commentId/delete', Auth.isLoggedIn, Auth.canModify, function(req, res) {
    new Request(req).setDeleted(req.params.commentId, true, function() {
        res.send({ success: true });
    });
});

// Restores a deleted comment
app.post('/auth/:sdk/:version/comments/:commentId/undo_delete', Auth.isLoggedIn, Auth.canModify, function(req, res) {
    new Request(req).setDeleted(req.params.commentId, false, function() {
        r.getComment(req.params.commentId, function(comment) {
            res.send({ success: true, comment: comment });
        });
    });
});

// Marks a comment 'read'
app.post('/auth/:sdk/:version/comments/:commentId/read', Auth.isLoggedIn, function(req, res) {
    new Request(req).markRead(req.params.commentId, function() {
        res.send({ success: true });
    });
});

// Returns all subscriptions for logged in user
app.get('/auth/:sdk/:version/subscriptions', function(req, res) {
    new Request(req).getSubscriptions(function(subs) {
        res.json({ subscriptions: subs });
    });
});

// Subscibe / unsubscribe to a comment thread
app.post('/auth/:sdk/:version/subscribe', Auth.isLoggedIn, function(req, res) {
    new Request(req).changeSubscription(req.body.target, req.body.subscribed === 'true', function() {
        res.send({ success: true });
    });
});

app.listen(config.port);
console.log("Server started at port "+config.port+"...");
